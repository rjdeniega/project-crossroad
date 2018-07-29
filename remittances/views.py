from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from members.serializers import SupervisorSerializer, MemberSerializer
from remittances.resources import BeepTransactionResource
from remittances.serializers import *
from .models import *
import json
from datetime import datetime
from tablib import Dataset


class ScheduleView(APIView):
    @staticmethod
    def get(request):
        schedules = ScheduleSerializer(Schedule.objects.all(), many=True)
        temp_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        active_sched = ScheduleSerializer(temp_sched)
        days_left = temp_sched.end_date - datetime.now().date()
        return Response(data={
            "days_left": days_left.days,
            "active_sched": active_sched.data,
            "schedules": schedules.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        schedule_serializer = ScheduleSerializer(data=data)
        if schedule_serializer.is_valid():
            schedule = schedule_serializer.create(validated_data=schedule_serializer.validated_data)
            print(schedule_serializer.errors)
            return Response(data={
                "start_date": schedule.start_date,
                "end_date": schedule.end_date
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": schedule_serializer.errors
            })


# Ignore this class for now
class ShiftView(APIView):
    @staticmethod
    def get(request):
        # edit filter later on what is needed
        shifts = ShiftSerializer(Shift.objects.all(), many=True)
        return Response(data={
            "shifts": shifts.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def delete(request, pk):
        Shift.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def put(request):
        pass


class ShiftIterationView(APIView):
    @staticmethod
    def get(request):
        shift_iterations = ShiftIterationSerializer(ShiftIteration.objects.all(), many=True)
        return Response(data={
            "shift_iterations": shift_iterations.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        shift_iteration_serializer = ShiftIterationSerializer(data=data)
        if shift_iteration_serializer.is_valid():
            shift_iteration = shift_iteration_serializer.create(
                validated_data=shift_iteration_serializer.validated_data)
            return Response(data={
                'shift_id': shift_iteration.shift.id,
                'date': shift_iteration.date
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                'errors': shift_iteration_serializer.errors
            })


class PlannedDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        print(supervisor_id)
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor=supervisor_id)
        drivers_assigned = PlannedDriversSerializer(
            DriversAssigned.objects.filter(shift=current_shift.id),
            many=True)
        return Response(data={
            "drivers_assigned": drivers_assigned.data
        }, status=status.HTTP_200_OK)


class NonDeployedDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor=supervisor_id)
        shift_iteration = ShiftIteration.objects.filter(shift=current_shift.id).order_by("-date").first()
        deployed_drivers = Deployment.objects.filter(shift_iteration=shift_iteration.id)

        drivers = []
        for deployed_driver in deployed_drivers:
            drivers.append(deployed_driver)

        query = DriversAssigned.objects.filter(shift=current_shift.id)

        for driver in drivers:
            query = query.exclude(driver=driver.driver.id)

        non_deployed_drivers = PlannedDriversSerializer(query, many=True)

        return Response(data={
            "non_deployed_drivers": non_deployed_drivers.data
        }, status=status.HTTP_200_OK)


class SubDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=supervisor_id)
        drivers_assigned = PlannedDriversSerializer(
            DriversAssigned.objects.filter(shift__schedule=active_sched.id).exclude(shift=current_shift.id),
            many=True)
        return Response(data={
            "sub_drivers": drivers_assigned.data
        }, status=status.HTTP_200_OK)


class DeploymentView(APIView):
    @staticmethod
    def get(request):
        deployments = GetDeploymentSerializer(Deployment.objects.all(), many=True)

        return Response(data={
            "deployments": deployments.data,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        supervisor_id = data.pop('supervisor')

        # def should_be_removed(data):
        #     list = []
        #     for ctr, assigned_ticket in enumerate(data['assigned_ticket']):
        #         if assigned_ticket['range_from'] == None and not ctr % 2 == 0:
        #             list.append(ctr)
        #
        #     new_list = sorted(list, reverse=True)
        #
        #     return new_list
        #
        # invalid_entries = should_be_removed(data)
        # empty_tickets = []
        # if invalid_entries is not None:
        #     for entry in invalid_entries:
        #         empty_tickets.append(data['assigned_ticket'][entry])
        #         del data['assigned_ticket'][entry]

        deployment_serializer = DeploymentSerializer(data=data)
        if deployment_serializer.is_valid():
            deployment = deployment_serializer.create(
                validated_data=deployment_serializer.validated_data,
                supervisor_id=supervisor_id
            )
            serialized_deployment = DeploymentSerializer(deployment)
            print(serialized_deployment)
            return Response(data={
                'deployment': serialized_deployment.data
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": deployment_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def delete(request, pk):
        Deployment.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeployedDrivers(APIView):
    # this function returns all ongoing deployments for the latest shift iteration of the supervisor
    @staticmethod
    def get(request, supervisor_id):
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by(
            "-date").first()
        deployments = Deployment.objects.filter(shift_iteration_id=current_shift_iteration.id, status='O')
        deployments_serializer = DeploymentSerializer(deployments, many=True)
        for item in deployments_serializer.data:
            driver = Driver.objects.get(id=item.get('driver'))
            item["driver_name"] = driver.name
        return Response(data={
            "deployed_drivers": deployments_serializer.data
        }, status=status.HTTP_200_OK)


class RemittanceUtilities():
    @staticmethod
    def get_active_schedule():
        active_schedule = Schedule.objects.get(
            start_date__lte=datetime.now().date(),
            end_date__gte=datetime.now().date())
        return active_schedule

    # this function returns the current latest shift_iteration for the shift
    @staticmethod
    def get_shift_iteration(shift_id):
        shift_iteration = ShiftIteration.objects.filter(shift=shift_id).order_by("-date").first()
        return shift_iteration

    @staticmethod
    def get_shift_iteration_sup(supervisor_id):
        shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by("-date").first()
        return shift_iteration

    # this function expects that the driver could only be assigned to one shift
    @staticmethod
    def get_shift_of_driver(driver_id):
        active_sched = RemittanceUtilities.get_active_schedule()
        shifts = Shift.objects.filter(schedule=active_sched.id)
        for shift in shifts:
            drivers_assigned = DriversAssigned.objects.filter(shift=shift.id)
            for driver_assigned in drivers_assigned:
                if driver_assigned.driver_id == driver_id:
                    return shift
        return None


class TicketUtilities():
    @staticmethod
    def get_num_of_void(assigned_ticket_id):
        void = 0
        void_tickets = VoidTicket.objects.filter(assigned_ticket=assigned_ticket_id)

        for void_ticket in void_tickets:
            void += 1

        return void

    # this function returns a deployment based from the remittance_id
    @staticmethod
    def get_deployment(remittance_id):
        remittance = RemittanceForm.objects.get(id=remittance_id)
        deployment = Deployment.objects.get(id=remittance.deployment.id)
        return deployment

    # this function returns a list of assigned tickets w/ their void tickets
    @staticmethod
    def get_tickets_with_void(deployment_id):
        tickets = AssignedTicket.objects.filter(deployment=deployment_id)

        final = list()

        a = 'first'
        b = 'first'
        c = 'first'
        a_key_start = '10_peso_start_'
        a_key_end = '10_peso_end_'
        b_key_start = '12_peso_start_'
        b_key_end = '12_peso_end_'
        c_key_start = '15_peso_start_'
        c_key_end = '15_peso_end_'

        for ticket in tickets:
            num_of_void = TicketUtilities.get_num_of_void(ticket.id)
            void_tickets = VoidTicket.objects.filter(assigned_ticket=ticket)
            void = list()

            for void_ticket in void_tickets:
                void.append({
                    'ticket_number': void_ticket.ticket_number
                })

            if ticket.type == 'A':
                a_key_start += a
                a_key_end += a

                final.append({
                    'assigned_ticket_id': ticket.id,
                    a_key_start: ticket.range_from,
                    a_key_end: ticket.range_to,
                    'number_of_void': num_of_void,
                    'void_tickets': void
                })

                a_key_start = '10_peso_start_'
                a_key_end = '10_peso_end_'
                a = 'second'

            elif ticket.type == 'B':
                b_key_start += b
                b_key_end += b

                final.append({
                    'assigned_ticket_id': ticket.id,
                    b_key_start: ticket.range_from,
                    b_key_end: ticket.range_to,
                    'number_of_void': num_of_void,
                    'void_tickets': void
                })

                b_key_start = '12_peso_start_'
                b_key_end = '12_peso_end_'
                b = 'second'

            else:
                c_key_start += c
                c_key_end += c

                final.append({
                    'assigned_ticket_id': ticket.id,
                    c_key_start: ticket.range_from,
                    c_key_end: ticket.range_to,
                    'number_of_void': num_of_void,
                    'void_tickets': void
                })

        return final

    # this function returns a summary of ticket details with consumed and total for each batch
    @staticmethod
    def get_consumed_with_assigned(deployment_id):
        tickets = AssignedTicket.objects.filter(deployment=deployment_id)

        final = list()

        a = 'first'
        b = 'first'
        c = 'first'
        a_key_start = '10_peso_start_'
        a_key_end = '10_peso_end_'
        b_key_start = '12_peso_start_'
        b_key_end = '12_peso_end_'
        c_key_start = '15_peso_start_'
        c_key_end = '15_peso_end_'

        for ticket in tickets:
            num_of_void = TicketUtilities.get_num_of_void(ticket.id)
            void_tickets = VoidTicket.objects.filter(assigned_ticket=ticket)
            void = list()

            for void_ticket in void_tickets:
                void.append({
                    'ticket_number': void_ticket.ticket_number
                })

            consumed_ticket = ConsumedTicket.objects.get(assigned_ticket=ticket.id)

            if ticket.type == 'A':
                a_key_start += a
                a_key_end += a

                final.append({
                    'assigned_ticket_id': ticket.id,
                    a_key_start: ticket.range_from,
                    a_key_end: ticket.range_to,
                    'number_of_void': num_of_void,
                    'void_tickets': void,
                    'consumed_end': consumed_ticket.end_ticket,
                    'total': consumed_ticket.total
                })

                a_key_start = '10_peso_start_'
                a_key_end = '10_peso_end_'
                a = 'second'

            elif ticket.type == 'B':
                b_key_start += b
                b_key_end += b

                final.append({
                    'assigned_ticket_id': ticket.id,
                    b_key_start: ticket.range_from,
                    b_key_end: ticket.range_to,
                    'number_of_void': num_of_void,
                    'void_tickets': void,
                    'consumed_end': consumed_ticket.end_ticket,
                    'total': consumed_ticket.total
                })

                b_key_start = '12_peso_start_'
                b_key_end = '12_peso_end_'
                b = 'second'

            else:
                c_key_start += c
                c_key_end += c

                final.append({
                    'assigned_ticket_id': ticket.id,
                    c_key_start: ticket.range_from,
                    c_key_end: ticket.range_to,
                    'number_of_void': num_of_void,
                    'void_tickets': void,
                    'consumed_end': consumed_ticket.end_ticket,
                    'total': consumed_ticket.total
                })

        return final

    # this function returns all the deployment details w/ remittances for the shift iteration
    @staticmethod
    def get_remittances_per_deployment(shift_iteration_id):
        deployments = Deployment.objects.filter(shift_iteration=shift_iteration_id)
        final = list()

        for deployment in deployments:
            deployment_details = TicketUtilities.get_consumed_with_assigned(deployment.id)
            remittance_details = RemittanceForm.objects.get(deployment=deployment)
            remittance = ReadRemittanceSerializer(remittance_details)
            photo = deployment.driver.photo if deployment.driver.photo else None
            final.append({
                'deployment_id': deployment.id,
                'driver': deployment.driver.name,
                'driver_photo': photo.url,
                'ticket_specifics': deployment_details,
                'remittance_details': remittance.data
            })

        return final


class DeploymentDetails(APIView):
    # to get deployment data of the driver for today
    # this expects that a driver could only be deployed once a day
    # change the algorithm if the driver could be deployed more than once
    @staticmethod
    def get(request, driver_id):
        shift = RemittanceUtilities.get_shift_of_driver(driver_id)
        shift_iteration = RemittanceUtilities.get_shift_iteration(shift.id)
        deployment_query = Deployment.objects.get(shift_iteration=shift_iteration)
        deployment = DeploymentSerializer(deployment_query)
        assigned_tickets = TicketUtilities.get_tickets_with_void(deployment_query.id)
        print(assigned_tickets)
        return Response(data={
            'deployment_details': deployment.data,
            'assigned_tickets': assigned_tickets,
        }, status=status.HTTP_200_OK)


class RemittanceFormView(APIView):
    @staticmethod
    def get(request):
        remittance_forms = RemittanceFormSerializer(RemittanceForm.objects.all(), many=True)
        am_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='A'),
                                            many=True)
        pm_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='P'),
                                            many=True)
        mn_forms = RemittanceFormSerializer(RemittanceForm.objects.filter(deployment__shift_iteration__shift__type='M'),
                                            many=True)

        return Response(data={
            "remittance_forms": remittance_forms.data,
            "am_forms": am_forms.data,
            "pm_forms": pm_forms.data,
            "mn_forms": mn_forms.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        remittance_serializer = RemittanceFormSerializer(data=data)
        if remittance_serializer.is_valid():
            remittance_form = remittance_serializer.create(validated_data=remittance_serializer.validated_data)
            print(remittance_form.total)
            return Response(data={
                "total": remittance_form.total
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": remittance_serializer.errors
            })

    @staticmethod
    def delete(request, pk):
        RemittanceForm.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConfirmRemittanceForm(APIView):
    # this get function returns all the unconfirmed remittances that the supervisor needs to approve
    @staticmethod
    def get(request, supervisor_id):
        active_sched = RemittanceUtilities.get_active_schedule()
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=supervisor_id)
        # TODO fix this
        current_iteration = RemittanceUtilities.get_shift_iteration(current_shift.id)
        query = RemittanceForm.objects.filter(status='P', deployment__shift_iteration=current_iteration.id)
        unconfirmed_remittances = list()

        for remittance in query:
            deployment = TicketUtilities.get_deployment(remittance.id)

            form = ReadRemittanceSerializer(remittance)
            tickets = TicketUtilities.get_consumed_with_assigned(remittance.deployment.id)

            unconfirmed_remittances.append({
                'driver_name': deployment.driver.name,
                'shift_type': deployment.shift_iteration.shift.type,
                'route': deployment.route,
                'remittance_details': form.data,
                'assigned_tickets': tickets
            })

        return Response(data={
            "unconfirmed_remittances": unconfirmed_remittances
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        remittance_form_id = data['remittance_form_id']
        remittance_form = RemittanceForm.objects.get(id=remittance_form_id)
        remittance_form.confirm_remittance()
        remittance_form = RemittanceFormSerializer(remittance_form)
        return Response(data={
            "remittance_form": remittance_form.data
        }, status=status.HTTP_200_OK)


class AddDiscrepancy(APIView):
    @staticmethod
    def post(request, remittance_form_id):
        data = json.loads(request.body)
        rem_form = RemittanceForm.objects.get(id=remittance_form_id)
        rem_form.discrepancy = data['discrepancy']
        rem_form.total = rem_form.total - rem_form.discrepancy
        rem_form.save()
        remittance = ReadRemittanceSerializer(rem_form)
        return Response(data={
            "remittance_form": remittance.data
        }, status=status.HTTP_200_OK)


class IterationUtilites():
    @staticmethod
    def get_iterations(shift_iterations):
        shifts = []
        for shift_iteration in shift_iterations:
            remittances = RemittanceForm.objects.filter(deployment__shift_iteration=shift_iteration.id)
            grand_total = 0
            for remittance in remittances:
                grand_total += remittance.total

            deployment_details = TicketUtilities.get_remittances_per_deployment(shift_iteration.id)
            # get shift details
            shift_iteration = ShiftIteration.objects.get(id=shift_iteration.id)
            iteration_serializer = ShiftIterationSerializer(shift_iteration)
            shifts.append({
                'grand_total': grand_total,
                'shift_type': shift_iteration.shift.type,
                'date_of_iteration': shift_iteration.date,
                'shift_iteration': iteration_serializer.data,
                'details': deployment_details
            })

        return shifts


class ShiftIterationReport(APIView):
    @staticmethod
    def get(request):
        shift_iterations = ShiftIteration.objects.all()
        return Response(data={
            "shift_iterations": IterationUtilites.get_iterations(shift_iterations)
        }, status=status.HTTP_200_OK)


class IterationsByDate(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = data['start_date']
        end_date = data['end_date']

        shift_iterations = ShiftIteration.objects.filter(date__gte=start_date, date__lte=end_date, status='F')
        return Response(data={
            "start_date": start_date,
            "end_date": end_date,
            "shift_iterations": IterationUtilites.get_iterations(shift_iterations)
        }, status=status.HTTP_200_OK)


class IterationsBySchedule(APIView):
    @staticmethod
    def get(request):
        schedule_list = list()
        schedules = Schedule.objects.all()

        for schedule in schedules:
            shifts = Shift.objects.filter(schedule=schedule)
            shift_list = []

            for shift in shifts:
                shift_iterations = ShiftIteration.objects.filter(shift=shift, status='F')
                iterations = IterationUtilites.get_iterations(shift_iterations)
                shift_list.append({
                    'supervisor': shift.supervisor.name,
                    'shift_type': shift.type,
                    'iterations': iterations
                })

            schedule_list.append({
                "start_date": schedule.start_date,
                "end_date": schedule.end_date,
                "shifts": shift_list
            })

        return Response(data={
            "schedules": schedule_list
        }, status=status.HTTP_200_OK)


class FinishShiftIteration(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        shift_iteration = RemittanceUtilities.get_shift_iteration_sup(data['supervisor_id'])
        shift_iteration.finish_shift()
        return Response(data={
            'iteration_id': shift_iteration.id,
            'iteration_status': shift_iteration.status
        }, status=status.HTTP_200_OK)


class BeepTransactionView(APIView):
    temp_shift = None

    @staticmethod
    def get(request):
        beep_shifts = []
        for shift in BeepShift.objects.all():
            dict_transactions = []
            transactions = [BeepTransactionSerializer(item) for item in BeepTransaction.objects.all() if
                            item.shift.id == shift.id]
            for transaction in transactions:
                transaction_instance = transaction.data
                try:
                    card = IDCards.objects.get(can=int(transaction_instance["card_number"]))
                except ObjectDoesNotExist:
                    card = None
                if card is not None:
                    member = card.member
                    transaction_instance["member"] = MemberSerializer(member).data
                else:
                    transaction_instance["member"] = None
                dict_transactions.append(transaction_instance)

            beep_shifts.append({
                "total": sum([float(item["total"]) for item in dict_transactions]),
                "shift": BeepShiftSerializer(shift).data,
                "transactions": dict_transactions
            })

        return Response(data={
            "beep_shifts": beep_shifts
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        print(request.data)
        shift_type = request.POST.get('shift_type')
        beep_shift = BeepTransactionView.shift_get_or_create(shift_type)
        BeepTransactionView.temp_shift = beep_shift
        beep_resource = BeepTransactionResource()
        dataset = Dataset()
        new_transactions = request.FILES['file']
        imported_data = dataset.load(new_transactions.read().decode('utf-8'), format='csv')
        dataset.append_col(BeepTransactionView.generate_column, header="shift")
        print(dataset)
        result = beep_resource.import_data(dataset, dry_run=True)  # Test the data import
        if not result.has_errors():
            beep_resource.import_data(dataset, dry_run=False)  # Actually import now

        return Response(data={
            "data": "it worked"
        }, status=status.HTTP_200_OK)

    @staticmethod
    def generate_column(row):
        return BeepTransactionView.temp_shift.id

    @staticmethod
    def shift_get_or_create(shift_type):
        for shift in BeepShift.objects.all():
            if shift.date == datetime.now().date() and shift.type == shift_type:
                print("its the same")
                return shift
        print("not the same")
        beep_shift = BeepShift()
        beep_shift.type = shift_type
        beep_shift.date = datetime.now()
        beep_shift.save()
        return beep_shift
