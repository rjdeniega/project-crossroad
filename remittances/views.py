from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from members.serializers import MemberSerializer, DriverSerializer
from remittances.resources import BeepTransactionResource
from remittances.serializers import *
from inventory.serializers import ShuttlesSerializer
from .models import *
import json
from datetime import datetime, time
from tablib import Dataset


class ScheduleView(APIView):
    @staticmethod
    def get(request):
        schedules = ScheduleSerializer(Schedule.objects.all(), many=True)
        temp_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        active_sched = []
        active_sched.append({
            'start_date': temp_sched.start_date,
            'end_date': temp_sched.end_date
        })
        days_left = temp_sched.end_date - datetime.now().date()
        return Response(data={
            "days_left": days_left.days,
            "active_sched": active_sched
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        schedule_serializer = ScheduleSerializer(data=data)
        if schedule_serializer.is_valid():
            schedule = schedule_serializer.create(validated_data=schedule_serializer.validated_data, original=data)
            print(schedule_serializer.errors)
            return Response(data={
                "start_date": schedule.start_date,
                "end_date": schedule.end_date
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": schedule_serializer.errors
            })


class GetDateSchedule(APIView):
    @staticmethod
    def get(request):
        schedule = Schedule.objects.all().order_by("-id").first()

        if schedule is None:
            return Response(data={
                'message': 'No Previous Schedule'
            }, status=status.HTTP_200_OK)

        start_date = schedule.end_date + timedelta(days=1)
        end_date = start_date + timedelta(days=14)

        return Response(data={
            "current_schedule": ScheduleSerializer(schedule).data,
            "expected_start_date": start_date,
            "expected_end_date": end_date
        }, status=status.HTTP_200_OK)


class CreateSchedule(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

        for shift in data["shifts"]:
            print(len(shift['drivers_assigned']))
            if len(shift['drivers_assigned']) < 7:
                return Response(data={
                    "error": "There must be 7 drivers per shift"
                }, status=status.HTTP_200_OK)

        schedule = Schedule()
        schedule.start_date = data['start_date']
        schedule.create()
        new_sched = Schedule.objects.get(id=schedule.id)
        new_sched.end_date = new_sched.start_date + timedelta(days=14)
        new_sched.save()

        for shift in data['shifts']:
            new_shift = Shift()
            new_shift.schedule_id = schedule.id
            new_shift.supervisor_id = shift['supervisor']
            new_shift.type = shift['type']
            new_shift.save()

            for drivers_assigned in shift['drivers_assigned']:
                driver = DriversAssigned()
                driver.shuttle_id = drivers_assigned['shuttle']
                driver.driver_id = drivers_assigned['driver']
                driver.shift_id = new_shift.id
                driver.deployment_type = drivers_assigned['deployment_type']
                driver.save()

        return Response(data={
            "start_date": new_sched.start_date,
            "end_date": new_sched.end_date
        }, status=status.HTTP_200_OK)


class ActiveScheduleView(APIView):
    @staticmethod
    def get(request):
        schedule = Schedule.objects.filter(start_date__lte=datetime.now().date(),
                                           end_date__gte=datetime.now().date()).first()

        if schedule is None:
            return Response(data={
                'message': 'No Active Schedule'
            }, status=status.HTTP_200_OK)

        tempshifts = []
        shifts = Shift.objects.filter(schedule=schedule.id)

        for shift in shifts:
            drivers = DriversAssigned.objects.filter(shift=shift.id)
            tempdrivers = []

            for driver in drivers:
                driver_object = DriversAssignedSerializer(driver)
                tempdrivers.append({
                    'id': driver.id,  # id for DriversAssigned object
                    'driver_id': driver.driver.id,  # id for the actual driver
                    'driver_name': driver.driver.name,
                    'shuttle_id': driver.shuttle.id,
                    'shuttle_plate_number': driver.shuttle.plate_number,
                    'shuttle_make': driver.shuttle.make,
                    'deployment_type': driver.deployment_type,
                    'driver_object': driver_object.data
                })

            tempshifts.append({
                'type': shift.type,
                'supervisor_id': shift.supervisor.id,
                'supervisor_name': shift.supervisor.name,
                'drivers': tempdrivers
            })

        return Response(data={
            'id': schedule.id,
            'start_date': schedule.start_date,
            'end_date': schedule.end_date,
            'shifts': tempshifts
        }, status=status.HTTP_200_OK)


class ScheduleHistoryView(APIView):
    @staticmethod
    def get(request):
        schedules = Schedule.objects.all()
        schedulehistory = []

        active_schedule = Schedule.objects.filter(start_date__lte=datetime.now().date(),
                                                  end_date__gte=datetime.now().date()).first()

        for schedule in schedules:
            tempshifts = []
            shifts = Shift.objects.filter(schedule=schedule.id)

            for shift in shifts:
                drivers = DriversAssigned.objects.filter(shift=shift.id)
                tempdrivers = []
                for driver in drivers:
                    driver_object = DriversAssignedSerializer(driver)
                    tempdrivers.append({
                        'id': driver.id,  # id for DriversAssigned object
                        'driver_id': driver.driver.id,  # id for the actual driver
                        'driver_name': driver.driver.name,
                        'shuttle_id': driver.shuttle.id,
                        'shuttle_plate_number': driver.shuttle.plate_number,
                        'shuttle_make': driver.shuttle.make,
                        'deployment_type': driver.deployment_type,
                        'driver_object': driver_object.data
                    })

                tempshifts.append({
                    'type': shift.type,
                    'supervisor_id': shift.supervisor.id,
                    'supervisor_name': shift.supervisor.name,
                    'drivers': tempdrivers,
                })

            schedulehistory.append({
                'id': schedule.id,
                'start_date': schedule.start_date,
                'end_date': schedule.end_date,
                "is_current": schedule.id == active_schedule.id,
                'schedule_status': schedule.get_status(active_schedule),
                'shifts': tempshifts
            })

        return Response(data={
            "schedule_history": reversed(schedulehistory)
        }, status=status.HTTP_200_OK)


class SpecificScheduleView(APIView):
    @staticmethod
    def get(request, schedule_id):
        schedule = Schedule.objects.get(id=schedule_id)
        tempshifts = []
        shifts = Shift.objects.filter(schedule=schedule.id)

        for shift in shifts:
            drivers = DriversAssigned.objects.filter(shift=shift.id)
            tempdrivers = []

            for driver in drivers:
                driver_object = DriversAssignedSerializer(driver)
                tempdrivers.append({
                    'id': driver.id,  # id for DriversAssigned object
                    'driver_id': driver.driver.id,  # id for the actual driver
                    'driver_name': driver.driver.name,
                    'shuttle_id': driver.shuttle.id,
                    'shuttle_plate_number': driver.shuttle.plate_number,
                    'shuttle_make': driver.shuttle.make,
                    'deployment_type': driver.deployment_type,
                    'driver_object': driver_object.data
                })

            tempshifts.append({
                'type': shift.type,
                'supervisor_id': shift.supervisor.id,
                'supervisor_name': shift.supervisor.name,
                'drivers': tempdrivers
            })

        return Response(data={
            'id': schedule.id,
            'start_date': schedule.start_date,
            'end_date': schedule.end_date,
            'shifts': tempshifts
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, schedule_id):
        schedule = Schedule.objects.get(pk=schedule_id)
        # delete existing drivers and replace with new data
        drivers = [driver for driver in DriversAssigned.objects.all() if driver.shift.schedule == schedule]
        am_drivers = [driver for driver in drivers if driver.shift.type == "A"]

        data = json.loads(request.body)
        shifts = data.pop('shifts')
        print(shifts)
        # get driver ids for comparison

        if len(shifts[0]['drivers_assigned']) > 0:
            print(shifts[0]['drivers_assigned'])
            data_am_drivers = [item for item in shifts[0]['drivers_assigned']]
            data_am_drivers_id = [item['driver_id'] for item in shifts[0]['drivers_assigned']]

            for item in am_drivers:
                if item.driver.id not in data_am_drivers_id:
                    item.delete()
                else:
                    x = [x for x in data_am_drivers if x['driver_id'] == item.driver.id][0]

                    item.shuttle = Shuttle.objects.get(pk=x['shuttle_id'])
                    item.deployment_type = Shuttle.objects.get(pk=x['deployment_type'])
                    item.save()

        if len(shifts[1]['drivers_assigned']) > 0:
            data_pm_drivers_id = [item for item in shifts[1]['drivers_assigned']]

        # DriversAssigned.objects.create(driver=Driver.objects.get(pk=1),
        #                                shift=Shift.objects.get(pk=1),
        #                                shuttle=Shuttle.objects.get(pk=1))



        return Response(data={
            'id': schedule.id,
            'start_date': schedule.start_date,
            'end_date': schedule.end_date,
        }, status=status.HTTP_200_OK)


class AssignTicketView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

        assigned_ticket = AssignedTicket()
        assigned_ticket.driver_id = data['driver_id']
        assigned_ticket.range_from = data['range_from']
        if data["ticket_type"] == 'A' or data["ticket_type"] == 'C':
            temp_string = int(data['range_from']) + 100 - 1
        else:
            temp_string = int(data['range_from']) + 200 - 1
        assigned_ticket.range_to = str(temp_string)
        assigned_ticket.type = data['ticket_type']
        assigned_ticket.save()

        driver = assigned_ticket.driver
        driver.remaining_tickets += 100
        driver.save()

        voids = []
        number_of_voids = 0
        for void_ticket in data["void_tickets"]:
            new_void = VoidTicket()
            new_void.ticket_number = void_ticket
            new_void.assigned_ticket_id = assigned_ticket.id
            new_void.save()

            voids.append({
                "void_id": new_void.id,
                "ticket_number": new_void.ticket_number
            })

            number_of_voids += 1

        saved_data = AssignedTicketSerializer(assigned_ticket)

        assigned_ticket_object = {
            "date": datetime.now().date(),
            "range_to": assigned_ticket.range_to,
            "range_from": assigned_ticket.range_from,
            "driver_name": assigned_ticket.driver.name,
            "driver_id": assigned_ticket.driver.pk,
            "type": assigned_ticket.get_type_display(),
            "number_of_voids": number_of_voids,
            "void_tickets": voids
        }

        return Response(data={
            "message": "Ticket Assigned",
            "assigned_ticket_object": assigned_ticket_object
        }, status=status.HTTP_200_OK)


class AssignedTicketHistory(APIView):
    @staticmethod
    def get(request):
        tickets = AssignedTicket.objects.all().order_by('-created')  # TODO order by date created

        ticket_assignments = []

        for ticket in tickets:

            number_of_voids = 0
            for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                number_of_voids += 1

            ticket_assignments.append({
                "driver_id": ticket.driver.pk,
                "driver_name": ticket.driver.name,
                "range_from": ticket.range_from,
                "range_to": ticket.range_to,
                "date": ticket.created.date(),
                "type": ticket.get_type_display(),
                "number_of_voids": number_of_voids
            })

        return Response(data={
            "ticket_assignments": ticket_assignments
        }, status=status.HTTP_200_OK)


class AssignedTicketHistoryPerSupervisor(APIView):
    @staticmethod
    def get(request, supervisor_id):
        date = datetime.now() - timedelta(days=90)
        tickets = AssignedTicket.objects.filter(created__gte=date).order_by('-created')[
                  :100]  # TODO order by date created

        ticket_assignments = []

        for ticket in tickets:

            number_of_voids = 0
            for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                number_of_voids += 1

            ticket_assignments.append({
                "driver_id": ticket.driver.pk,
                "driver_name": ticket.driver.name,
                "range_from": ticket.range_from,
                "range_to": ticket.range_to,
                "date": ticket.created.date(),
                "type": ticket.get_type_display(),
                "number_of_voids": number_of_voids
            })
            active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(),
                                                end_date__gte=datetime.now().date())

            drivers = DriversAssigned.objects.filter(shift__schedule=active_sched)
            drivers = [item.driver.pk for item in drivers]

            # get assigned drivers only
            ticket_assignments = [item for item in ticket_assignments if item['driver_id'] in drivers]

        return Response(data={
            "ticket_assignments": ticket_assignments
        }, status=status.HTTP_200_OK)


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
        shift_iteration = ShiftIteration.objects.filter(shift=current_shift.id, date=datetime.now().date()).first()

        query = DriversAssigned.objects.filter(shift=current_shift.id)
        print(query)
        isAbsent = list()
        if current_shift.type == "A" and (datetime.now().hour > 12 or datetime.now().hour < 4):
            print("AM is disabled")
            return Response(data={
                "non_deployed_drivers": [],
                "disabled": "AM"
            }, status=status.HTTP_200_OK)
        elif current_shift.type == "P" and (datetime.now().hour > 23 or datetime.now().hour < 13):
            print("PM is disabled")
            return Response(data={
                "non_deployed_drivers": [],
                "disabled": "PM"
            }, status=status.HTTP_200_OK)

        for driver in DriversAssigned.objects.filter(shift=current_shift.id):
            isPresent = False
            for present in PresentDrivers.objects.filter(
                    datetime__year=datetime.now().year,
                    datetime__month=datetime.now().month,
                    datetime__day=datetime.now().day
            ):
                if driver.id == present.assignedDriver.id and present.is_dayoff == False:
                    isPresent = True

            if isPresent == False:
                isAbsent.append(driver.id)

        for absent in isAbsent:
            query = query.exclude(id=absent)

        # remove drivers already deployed
        if shift_iteration:
            deployed_drivers = Deployment.objects.filter(shift_iteration=shift_iteration.id)

            drivers = []
            for deployed_driver in deployed_drivers:
                drivers.append(deployed_driver)

            for driver in drivers:
                query = query.exclude(driver=driver.driver.id)

            for driver in query:
                if NonDeployedDrivers.did_deploy_a_sub(driver.id, shift_iteration.id):
                    query = query.exclude(driver=driver.driver.id)

        non_deployed_drivers = PlannedDriversSerializer(query, many=True)

        for item in non_deployed_drivers.data:

            present = PresentDrivers.objects.get(
                assignedDriver=item["id"],
                datetime__year=datetime.now().year,
                datetime__month=datetime.now().month,
                datetime__day=datetime.now().day
            )

            item["driver"]["shuttle_id"] = item["shuttle"]["id"]
            item["driver"]["shuttle_plate_number"] = item["shuttle"]["plate_number"]

            if item['deployment_type'] == 'Early' and item['shift']['type'] == 'A':
                item['expected_departure'] = "4:30 AM"
                item["is_late"] = False if present.datetime < present.datetime.replace(hour=4, minute=30) else True
            elif item['deployment_type'] == 'Regular' and item['shift']['type'] == 'A':
                item['expected_departure'] = "5:00 AM"
                item["is_late"] = False if present.datetime < present.datetime.replace(hour=5) else True
            elif item['deployment_type'] == 'Regular' and item['shift']['type'] == 'P':
                item['expected_departure'] = "2:00 PM"
                item["is_late"] = False if present.datetime < present.datetime.replace(hour=14) else True
            else:
                item['expected_departure'] = "3:00 PM"
                item["is_late"] = False if present.datetime < present.datetime.replace(hour=15) else True

            tickets = TicketUtilities.get_assigned_with_void_of_driver(item["driver"]["id"])

            item["ten_peso_tickets"] = []
            item["twelve_peso_tickets"] = []
            item["fifteen_peso_tickets"] = []

            ten_total = 0
            twelve_total = 0
            fifteen_total = 0

            for ticket in tickets:
                if ticket["ticket_type"] == '10 Pesos':
                    ten_total += ticket["range_to"] - ticket["range_from"] + 1
                    item["ten_peso_tickets"].append(ticket)
                elif ticket["ticket_type"] == '12 Pesos':
                    twelve_total += ticket["range_to"] - ticket["range_from"] + 1
                    item["twelve_peso_tickets"].append(ticket)
                else:
                    fifteen_total += ticket["range_to"] - ticket["range_from"] + 1
                    item["fifteen_peso_tickets"].append(ticket)

            item["ten_total"] = ten_total
            item["twelve_total"] = twelve_total
            item["fifteen_total"] = fifteen_total

            item["is_shuttle_deployed"] = NonDeployedDrivers.is_shuttle_deployed(item["shuttle"])

            item["deploy_with_back_up"] = NonDeployedDrivers.should_be_deployed(item['deployment_type'],
                                                                                item['shift']['type'],
                                                                                item["is_shuttle_deployed"])

        return Response(data={
            "non_deployed_drivers": non_deployed_drivers.data,
            "disabled": "No"
        }, status=status.HTTP_200_OK)

    @staticmethod
    def did_deploy_a_sub(driver_id, shift_iteration_id):
        deployments = Deployment.objects.filter(shift_iteration_id=shift_iteration_id)
        print(driver_id)
        for deployment in deployments:
            subbed_deployment = SubbedDeployments.objects.filter(deployment=deployment,
                                                                 absent_driver_id=driver_id).first()

            if subbed_deployment:
                print(subbed_deployment)
                print("entered here")
                return True

        return False

    @staticmethod
    def is_shuttle_deployed(shuttle):
        deployments = Deployment.objects.filter(status="O")

        for deployment in deployments:
            if shuttle["id"] == deployment.shuttle.id:
                return True

        return False

    @staticmethod
    def should_be_deployed(dep_type, shift_type, is_shuttle_deployed):
        if dep_type == 'Early' and shift_type == 'A':
            date = datetime.now()
            force_dep = date.replace(hour=5, minute=30)
        elif dep_type == 'Regular' and shift_type == 'A':
            date = datetime.now()
            force_dep = date.replace(hour=7, minute=30)
        elif dep_type == 'Regular' and shift_type == 'P':
            date = datetime.now()
            force_dep = date.replace(hour=14, minute=30)
        else:
            date = datetime.now()
            force_dep = date.replace(hour=16, minute=30)

        if force_dep <= datetime.now() and is_shuttle_deployed == True:
            return True
        return False


class BackUpShuttles(APIView):
    @staticmethod
    def get(request):
        shuttles = Shuttle.objects.filter(route='B', status="A")

        deployed_shuttles = []
        for shuttle in shuttles:
            if BackUpShuttles.is_shuttle_deployed(shuttle):
                deployed_shuttles.append(shuttle.id)

        for shuttle_id in deployed_shuttles:
            shuttles.exclude(id=shuttle_id)

        serialized_shuttles = ShuttlesSerializer(shuttles, many=True)

        return Response(data={
            "shuttles": serialized_shuttles.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        is_valid = True

        supervisor_id = data['supervisor_id']
        driver_id = data['driver_id']
        shuttle_id = data['shuttle_id']

        # CREATE SHIFT-ITERATION WHEN THERE IS NOTHING FOR THE DAY YET
        if DeploymentView.is_first_deployment(supervisor_id):
            iteration = ShiftIteration()

            active_sched = RemittanceUtilities.get_active_schedule();
            for shift in Shift.objects.filter(schedule=active_sched.id):
                print(shift.supervisor.id)
                print(supervisor_id)
                if shift.supervisor.id == supervisor_id:
                    shift_id = shift.id

            iteration.shift_id = shift_id
            iteration.date = datetime.now()
            iteration.save()

        else:
            iteration = ShiftIteration.objects.filter(
                shift__supervisor=supervisor_id
            ).order_by("-date").first()

        driver_assigned = DriversAssigned.objects.get(
            shift_id=iteration.shift,
            driver_id=driver_id
        )

        # CREATE DEPLOYMENT
        if is_valid:
            deployment = Deployment.objects.create(
                driver_id=driver_id,
                shuttle_id=shuttle_id,
                route=driver_assigned.shuttle.route,
                shift_iteration_id=iteration.id
            )

            serialized_deployment = DeploymentSerializer(deployment)

            return Response(data={
                'deployment': serialized_deployment.data
            }, status=status.HTTP_200_OK)

        else:
            return Response(data={
                "errors": ""
            }, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def is_shuttle_deployed(shuttle):
        deployments = Deployment.objects.filter(status="O")

        for deployment in deployments:
            if shuttle.id == deployment.shuttle.id:
                return True

        return False


class SubDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=supervisor_id)
        drivers_assigned = PlannedDriversSerializer(
            DriversAssigned.objects.filter(shift__schedule=active_sched.id).exclude(shift=current_shift.id),
            many=True)

        sub_drivers = drivers_assigned.data

        info = DriverSerializer(current_shift.supervisor)

        sub_drivers.append({
            "driver": info.data
        })

        return Response(data={
            "sub_drivers": sub_drivers
        }, status=status.HTTP_200_OK)


class AbsentDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor_id=supervisor_id)
        query = DriversAssigned.objects.filter(shift=current_shift)

        absentList = list()
        for driver in DriversAssigned.objects.filter(shift=current_shift.id):
            isAbsent = True
            for present in PresentDrivers.objects.filter(
                    datetime__year=datetime.now().year,
                    datetime__month=datetime.now().month,
                    datetime__day=datetime.now().day
            ):
                if driver.id == present.assignedDriver.id:
                    isAbsent = False

            if isAbsent == False:
                absentList.append(driver.id)

        for absent in absentList:
            query = query.exclude(id=absent)

        data = PlannedDriversSerializer(query, many=True)
        return Response(data={
            "absent_drivers": data.data
        }, status=status.HTTP_200_OK)


class SpecificDriver(APIView):
    @staticmethod
    def get(request, driver_id, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        shift = Shift.objects.get(schedule=active_sched, supervisor_id=supervisor_id)

        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor_id=supervisor_id).order_by(
            '-date').first()

        if DeploymentView.is_in_shift(driver_id, shift.id):
            driver_assigned = DriversAssigned.objects.get(shift=shift, driver_id=driver_id)
        else:
            shifts = Shift.objects.filter(schedule=active_sched)

            for shift in shifts:
                if shift.id != current_shift_iteration.shift.id:
                    other_shift = shift

            driver_assigned = DriversAssigned.objects.get(
                shift_id=other_shift.id,
                driver_id=driver_id
            )

        print(driver_assigned.shuttle.status)
        if driver_assigned.shuttle.status == 'UM':
            is_under_maintenance = True
        else:
            is_under_maintenance = False
        print(is_under_maintenance)

        # I dont want to change front-end too much
        ten_peso = []
        twelve_peso = []
        fifteen_peso = []
        for item in TicketUtilities.get_assigned_with_void_of_driver(driver_id):
            if item["ticket_type"] == "10 Pesos":
                ten_peso.append(item)
            elif item["ticket_type"] == "12 Pesos":
                twelve_peso.append(item)
            else:
                fifteen_peso.append(item)

        # get last 2 items of array (most recent ones)
        ten_peso = DeploymentDetails.get_recent_tickets(ten_peso)
        twelve_peso = DeploymentDetails.get_recent_tickets(twelve_peso)
        fifteen_peso = DeploymentDetails.get_recent_tickets(fifteen_peso)

        assigned_tickets = [
            ten_peso[0],
            ten_peso[1],
            twelve_peso[0],
            twelve_peso[1],
            fifteen_peso[0],
            fifteen_peso[1],
        ]

        return Response(data={
            "shuttle_id": driver_assigned.shuttle.id,
            "shuttle_make": driver_assigned.shuttle.make,
            "route": driver_assigned.shuttle.get_route_display(),
            "shuttle_plate_number": driver_assigned.shuttle.plate_number,
            "driver_name": driver_assigned.driver.name,
            "driver_id": driver_assigned.driver.id,
            "is_under_maintenance": is_under_maintenance,
            "tickets": assigned_tickets
        }, status=status.HTTP_200_OK)


class SpecificDeploymentView(APIView):
    @staticmethod
    def get(request, shift_id):
        deployments = Deployment.objects.filter(shift_iteration__id=shift_id)
        deployments = DeploymentSerializer(deployments, many=True)
        for item in deployments.data:
            x = Deployment.objects.get(pk=item['id'])
            item['shift_date'] = x.shift_iteration.date.strftime("%b %d %Y")
            item['start_time'] = x.start_time.strftime("%I:%M %p")
            item['end_time'] = None
            if item['end_time'] is not None:
                item['end_time'] = x.end_time.strftime("%I:%M %p")

            item['driver_object'] = DriverSerializer(Driver.objects.get(pk=item['driver'])).data

        return Response(data={
            "deployments": deployments.data,
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
        is_valid = True

        supervisor_id = data['supervisor_id']
        driver_id = data['driver_id']

        # CREATE SHIFT-ITERATION WHEN THERE IS NOTHING FOR THE DAY YET
        if DeploymentView.is_first_deployment(supervisor_id):
            iteration = ShiftIteration()

            active_sched = RemittanceUtilities.get_active_schedule();
            for shift in Shift.objects.filter(schedule=active_sched.id):
                if shift.supervisor.id == supervisor_id:
                    shift_id = shift.id

            iteration.shift_id = shift_id
            iteration.date = datetime.now()
            iteration.save()

        else:
            iteration = ShiftIteration.objects.filter(
                shift__supervisor=supervisor_id
            ).order_by("-date").first()

        # VALIDATIONS
        driver_assigned = DriversAssigned.objects.get(
            shift_id=iteration.shift,
            driver_id=driver_id
        )

        if driver_assigned.shuttle.status is 'UM':
            error_message = driver_assigned.driver.name + "'s shuttle is currently " + driver_assigned.shuttle.get_status_display()
            is_valid = False

        # CREATE DEPLOYMENT
        if is_valid:
            deployment = Deployment.objects.create(
                driver_id=driver_id,
                shuttle_id=driver_assigned.shuttle.id,
                route=driver_assigned.shuttle.route,
                shift_iteration_id=iteration.id
            )

            presents = PresentDrivers.objects.filter(
                assignedDriver=driver_assigned,
                datetime__year=datetime.now().year,
                datetime__month=datetime.now().month,
                datetime__day=datetime.now().day
            )

            for present in presents:
                present.deployment = deployment
                present.save()

            serialized_deployment = DeploymentSerializer(deployment)

            return Response(data={
                'deployment': serialized_deployment.data
            }, status=status.HTTP_200_OK)

        else:
            return Response(data={
                "errors": error_message
            }, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def delete(request, pk):
        Deployment.objects.get(id=pk).delete(user=request.user.username)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def is_in_shift(driver_id, shift_id):
        drivers = DriversAssigned.objects.filter(shift=shift_id)
        for driver in drivers:
            if driver.driver.id == driver_id:
                return True
        return False

    @staticmethod
    def is_first_deployment(supervisor_id):
        print(type(supervisor_id))
        shift_iteration = ShiftIteration.objects.filter(
            shift__supervisor_id=supervisor_id,
            date=datetime.now()
        )
        print(type(shift_iteration))
        print(shift_iteration)
        if not shift_iteration:
            return True
        else:
            return False


class DeploySubDriver(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        is_valid = True
        print(data)
        supervisor_id = data['supervisor_id']
        driver_id = data['driver_id']
        absent_id = data['absent_id']

        # CREATE SHIFT-ITERATION WHEN THERE IS NOTHING FOR THE DAY YET
        if DeploymentView.is_first_deployment(supervisor_id):
            iteration = ShiftIteration()

            active_sched = RemittanceUtilities.get_active_schedule();
            for shift in Shift.objects.filter(schedule=active_sched.id):
                print(shift.supervisor.id)
                print(supervisor_id)
                if shift.supervisor.id == supervisor_id:
                    shift_id = shift.id

            iteration.shift_id = shift_id
            iteration.date = datetime.now()
            iteration.save()

        else:
            iteration = ShiftIteration.objects.filter(
                shift__supervisor=supervisor_id
            ).order_by("-date").first()

        # VALIDATIONS
        driver_assigned = DriversAssigned.objects.get(
            shift_id=iteration.shift,
            driver_id=absent_id
        )

        if driver_assigned.shuttle.status is 'UM':
            error_message = driver_assigned.driver.name + "'s shuttle is currently " + driver_assigned.shuttle.get_status_display()
            is_valid = False

        # CREATE DEPLOYMENT
        if is_valid:
            deployment = Deployment.objects.create(
                driver_id=driver_id,
                shuttle_id=driver_assigned.shuttle.id,
                route=driver_assigned.shuttle.route,
                shift_iteration_id=iteration.id
            )

            sub_deployment = SubbedDeployments.objects.create(
                deployment=deployment,
                absent_driver=driver_assigned
            )

            serialized_deployment = DeploymentSerializer(deployment)

            return Response(data={
                'deployment': serialized_deployment.data
            }, status=status.HTTP_200_OK)

        else:
            return Response(data={
                "errors": error_message
            }, status=status.HTTP_400_BAD_REQUEST)


class MarkAsPresent(APIView):
    @staticmethod
    def get(request, driver_id):
        active_sched = RemittanceUtilities.get_active_schedule();

        driver = None
        for shift in Shift.objects.filter(schedule=active_sched):
            for assignedDriver in DriversAssigned.objects.filter(shift=shift):
                if assignedDriver.driver.id == driver_id:
                    driver = assignedDriver

        presents = PresentDrivers.objects.filter(
            assignedDriver=driver,
            datetime__year=datetime.now().year,
            datetime__month=datetime.now().month,
            datetime__day=datetime.now().day
        )

        if presents:
            toReturn = presents[0].datetime.strftime("%r")
            hasTimedIn = True
        else:
            toReturn = None
            hasTimedIn = False

        return Response(data={
            "timeIn": toReturn,
            "hasTimedIn": hasTimedIn
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        active_sched = RemittanceUtilities.get_active_schedule();
        print(data["driver_id"])
        driver = None
        for shift in Shift.objects.filter(schedule=active_sched):
            for assignedDriver in DriversAssigned.objects.filter(shift=shift):
                if assignedDriver.driver.id == data["driver_id"]:
                    driver = assignedDriver
        print(driver)
        presentDriver = PresentDrivers()
        presentDriver.assignedDriver = driver
        presentDriver.datetime = datetime.now()
        presentDriver.save()

        return Response({
            "driver": assignedDriver.driver.name,
            "timeIn": presentDriver.datetime.strftime("%r")
        }, status=status.HTTP_200_OK)


class DayOffDriver(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        active_sched = RemittanceUtilities.get_active_schedule();
        print(data["driver_id"])
        driver = None
        for shift in Shift.objects.filter(schedule=active_sched):
            for assignedDriver in DriversAssigned.objects.filter(shift=shift):
                if assignedDriver.driver.id == data["driver_id"]:
                    driver = assignedDriver

        presents = PresentDrivers.objects.filter(
            assignedDriver=driver,
            datetime__year=datetime.now().year,
            datetime__month=datetime.now().month,
            datetime__day=datetime.now().day
        )

        if presents:
            present = presents[0]
            present.is_dayoff = True
            present.save()

            return Response(data={
                "message": "driver is now taking a dayoff"
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "message": "problem occured regarding present drivers obj"
            }, status=status.HTTP_200_OK)


class DeployedDrivers(APIView):
    # this function returns all ongoing deployments for the latest shift iteration of the supervisor
    @staticmethod
    def get(request, supervisor_id):
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by(
            "-date").first()
        deployments = Deployment.objects.filter(shift_iteration_id=current_shift_iteration.id, status='O')
        deployments_serializer = DeploymentSerializer(deployments, many=True)

        # INSERT NEEDED DATA FOR LIST
        for item in deployments_serializer.data:
            driver = DriverSerializer(Driver.objects.get(id=item.get('driver')))
            shuttle = ShuttlesSerializer(Shuttle.objects.get(id=item.get('shuttle')))
            deployment = Deployment.objects.get(id=item["id"]);
            time = deployment.start_time
            item["route"] = deployment.route
            item["driver"] = driver.data
            item["shuttle"] = shuttle.data
            item["start_time"] = time.strftime("%I:%M %p")

            if DeployedDrivers.is_sub(item['id']):
                sub_deployment = SubbedDeployments.objects.filter(deployment_id=item['id']).get()
                absent_driver_id = sub_deployment.absent_driver.driver.id
                absent_driver_obj = DriverSerializer(Driver.objects.get(id=absent_driver_id))
                item["absent_driver"] = absent_driver_obj.data
                tickets = TicketUtilities.get_assigned_with_void_of_driver(item["driver"]["id"])

                item["ten_peso_tickets"] = []
                item["twelve_peso_tickets"] = []
                item["fifteen_peso_tickets"] = []

                for ticket in tickets:
                    if ticket["ticket_type"] == '10 Pesos':
                        item["ten_peso_tickets"].append(ticket)
                    elif ticket["ticket_type"] == '12 Pesos':
                        item["twelve_peso_tickets"].append(ticket)
                    else:
                        item["fifteen_peso_tickets"].append(ticket)
            else:
                tickets = TicketUtilities.get_assigned_with_void_of_driver(item["driver"]["id"])

                item["ten_peso_tickets"] = []
                item["twelve_peso_tickets"] = []
                item["fifteen_peso_tickets"] = []

                for ticket in tickets:
                    if ticket["ticket_type"] == '10 Pesos':
                        item["ten_peso_tickets"].append(ticket)
                    elif ticket["ticket_type"] == '12 Pesos':
                        item["twelve_peso_tickets"].append(ticket)
                    else:
                        item["fifteen_peso_tickets"].append(ticket)

        return Response(data={
            "deployed_drivers": deployments_serializer.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def is_sub(deployment_id):
        for item in SubbedDeployments.objects.filter(deployment_id=deployment_id):
            return True
        return False


class ShuttleBreakdown(APIView):
    @staticmethod
    def get(request, deployment_id):
        deployment = Deployment.objects.get(id=deployment_id);
        shift_iteration = ShiftIteration.objects.get(id=deployment.shift_iteration.id)

        shuttles = Shuttle.objects.filter().exclude(id=deployment.shuttle.id, status="UM")

        deployments = Deployment.objects.filter(shift_iteration=shift_iteration.id)

        for deployment in deployments:
            shuttles = shuttles.exclude(id=deployment.shuttle.id)

        serialized_shuttle = ShuttlesSerializer(shuttles, many=True)
        return Response(data={
            "shuttles": serialized_shuttle.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)

        deployment = Deployment.objects.get(id=data["deployment_id"])
        shuttle = Shuttle.objects.get(id=data["shuttle_id"])

        new_deployment = Deployment.objects.create(
            driver=deployment.driver,
            shuttle=shuttle,
            route=deployment.route,
            shift_iteration=deployment.shift_iteration,
        )

        redeployment = Redeployments.objects.create(
            deployment=new_deployment,
            prior_deployment=deployment
        )

        deployment.set_deployment_breakdown()

        shuttle.status = 'FI'
        shuttle.save()

        serialized_deployment = DeploymentSerializer(new_deployment)

        return Response(data={
            "redeployment": serialized_deployment.data
        }, status=status.HTTP_200_OK)


class RedeployDriver(APIView):
    @staticmethod
    def get(request, deployment_id):
        deployment = Deployment.objects.get(id=deployment_id)
        shift_iteration = ShiftIteration.objects.get(id=deployment.shift_iteration.id)

        drivers = Driver.objects.filter(is_supervisor=False)

        deployments = Deployment.objects.filter(shift_iteration=shift_iteration.id)

        for deployment in deployments:
            drivers = drivers.exclude(id=deployment.driver.id)

        serialized_drivers = DriverSerializer(drivers, many=True)
        drivers = serialized_drivers.data

        supervisor = DriverSerializer(Driver.objects.get(id=shift_iteration.shift.supervisor.id))

        drivers.append(supervisor.data)

        return Response(data={
            "available_drivers": drivers
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)

        deployment = Deployment.objects.get(id=data["deployment_id"])
        driver = Driver.objects.get(id=data["driver_id"])

        new_deployment = Deployment.objects.create(
            driver=driver,
            shuttle=deployment.shuttle,
            route=deployment.route,
            shift_iteration=deployment.shift_iteration,
        )

        redeployment = Redeployments.objects.create(
            deployment=new_deployment,
            prior_deployment=deployment
        )

        deployment.set_deployment_early()

        serialized_deployment = DeploymentSerializer(new_deployment)

        return Response(data={
            "redeployment": serialized_deployment.data
        }, status=status.HTTP_200_OK)


class ShouldShowTimeIn(APIView):
    @staticmethod
    def get(request, driver_id):
        ss = ShouldShowTimeIn()
        active_sched = RemittanceUtilities.get_active_schedule();

        driver = None
        for shift in Shift.objects.filter(schedule=active_sched):
            for assignedDriver in DriversAssigned.objects.filter(shift=shift):
                if assignedDriver.driver.id == driver_id:
                    driver = assignedDriver

        is_shown = False
        if ss.is_PM(driver.shift.type) and datetime.now().hour >= 12:
            is_shown = True

        if ss.is_AM(driver.shift.type) and (datetime.now().hour >= 3 and datetime.now().hour < 12):
            is_shown = True

        print(datetime.now().hour)
        print(is_shown)
        return Response(data={
            "is_shown": is_shown
        }, status=status.HTTP_200_OK)

    @staticmethod
    def is_PM(shift):
        if shift == 'P' or shift == 'PM':
            return True
        return False

    @staticmethod
    def is_AM(shift):
        print(shift)
        if shift == 'A' or shift == 'AM':
            return True
        return False


class AccidentDeployment(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

        deployment = Deployment.objects.get(id=data["deployment_id"])

        deployment.set_deployment_accident()

        deployment.shuttle.status = 'FI'
        deployment.shuttle.save()

        return Response(data={
            "message": "Deployment has been successfully stopped",
            "deployment_id": deployment.id
        }, status=status.HTTP_200_OK)


class DriverDeployment(APIView):
    @staticmethod
    def get(request, driver_id):
        deployments = Deployment.objects.filter(driver_id=driver_id).order_by('-start_time')[:90]

        data = []

        for deployment in deployments:
            endtime = None
            if deployment.end_time:
                endtime = deployment.end_time.strftime("%I:%M %p")

            shuttle = "#" + str(deployment.shuttle.shuttle_number) + " - " + deployment.shuttle.plate_number

            data.append({
                'id': deployment.id,
                'shift_date': deployment.shift_iteration.date.strftime("%b %d %Y"),
                'start_time': deployment.start_time.strftime("%I:%M %p"),
                'end_time': endtime,
                'status': deployment.status,
                'shuttle': shuttle,
                'route': deployment.route,
                'is_redeploy_shown': DriverDeployment.is_redeploy_shown(deployment.shift_iteration.shift.supervisor,
                                                                        deployment.status)
            })

        print(data)
        return Response(data={
            'deployments': data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def is_redeploy_shown(supervisor, status):
        deployments = Deployment.objects.filter(status='O', driver=supervisor)

        if deployments and status == 'O':
            return True
        return False


class DeploymentTickets(APIView):
    @staticmethod
    def get(request, deployment_id):
        deployment = Deployment.objects.get(id=deployment_id);

        ten_tickets = AssignedTicket.objects.filter(
            driver=deployment.driver,
            type="A",
            is_consumed=False
        )

        twelve_tickets = AssignedTicket.objects.filter(
            driver=deployment.driver,
            type="B",
            is_consumed=False
        )

        fifteen_tickets = AssignedTicket.objects.filter(
            driver=deployment.driver,
            type="C",
            is_consumed=False
        )

        ten_list = []
        twelve_list = []
        fifteen_list = []

        for ten in ten_tickets:
            ten_list.append(DeploymentTickets.getUsableTickets(ten))

        for twelve in twelve_tickets:
            twelve_list.append(DeploymentTickets.getUsableTickets(twelve))

        for fifteen in fifteen_tickets:
            fifteen_list.append(DeploymentTickets.getUsableTickets(fifteen))

        return Response(data={
            "ten_tickets": ten_list,
            "twelve_tickets": twelve_list,
            "fifteen_tickets": fifteen_list
        }, status=status.HTTP_200_OK)

    @staticmethod
    def getUsableTickets(ticket):
        consumed = ConsumedTicket.objects.filter(assigned_ticket=ticket).order_by('-end_ticket').first()

        if consumed is not None:
            tickets_left = {
                'id': ticket.id,
                'start_ticket': consumed.end_ticket + 1,
                'end_ticket': ticket.range_to
            }
        else:
            tickets_left = {
                'id': ticket.id,
                'start_ticket': ticket.range_from,
                'end_ticket': ticket.range_to
            }

        return tickets_left


class SubmitRemittance(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body);
        print(data)
        deployment = Deployment.objects.get(id=data["deployment_id"]);

        ten_valid = SubmitRemittance.isTicketsValid(data["ten_peso_tickets"])
        twelve_valid = SubmitRemittance.isTicketsValid(data["twelve_peso_tickets"])
        fifteen_valid = SubmitRemittance.isTicketsValid(data["fifteen_peso_tickets"])

        if SubmitRemittance.isMileageValid(data["mileage"], deployment.shuttle) == False:
            return Response(data={
                "error": "Mileage is invalid"
            }, status=status.HTTP_400_BAD_REQUEST)

        if ten_valid == False or twelve_valid == False or fifteen_valid == False:
            return Response(data={
                "error": "Ticket Range is Not Valid"
            }, status=status.HTTP_400_BAD_REQUEST)

        # create remittance form
        rem_form = RemittanceForm()
        rem_form.deployment = deployment
        if "fuel_costs" in data:
            rem_form.fuel_cost = data["fuel_costs"]
        else:
            rem_form.fuel_cost = 0

        if "or_number" in data:
            rem_form.fuel_receipt = data["or_number"]

        if "vulcanizing_cost" in data:
            rem_form.other_cost = data["vulcanizing_cost"]
        else:
            rem_form.other_cost = 0

        rem_form.km_from = deployment.shuttle.mileage
        rem_form.km_to = data["mileage"]

        deployment.shuttle.mileage = data["mileage"]

        rem_form.save()

        for ticket_used in data["ten_peso_tickets"]:
            assigned = AssignedTicket.objects.get(id=ticket_used["id"])

            if "value" in ticket_used:
                if ticket_used["value"]:
                    # Get current tickets
                    consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=assigned)
                    last_consumed = consumed_tickets.order_by('-end_ticket').first()

                    new_consumed = ConsumedTicket()
                    new_consumed.assigned_ticket = assigned
                    if last_consumed is not None:
                        new_consumed.start_ticket = last_consumed.end_ticket + 1
                    else:
                        new_consumed.start_ticket = assigned.range_from
                    new_consumed.end_ticket = ticket_used["value"]
                    new_consumed.total = (float(new_consumed.end_ticket) - float(new_consumed.start_ticket)) * 10
                    new_consumed.remittance_form = rem_form
                    new_consumed.save()

                    rem_form.total += new_consumed.total

                    if assigned.range_to == new_consumed.end_ticket:
                        assigned.is_consumed = True
                        assigned.save()

        for ticket_used in data["twelve_peso_tickets"]:
            assigned = AssignedTicket.objects.get(id=ticket_used["id"])

            if "value" in ticket_used:
                if ticket_used["value"]:
                    # Get current tickets
                    consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=assigned)
                    last_consumed = consumed_tickets.order_by('-end_ticket').first()

                    new_consumed = ConsumedTicket()
                    new_consumed.assigned_ticket = assigned
                    if last_consumed is not None:
                        new_consumed.start_ticket = last_consumed.end_ticket + 1
                    else:
                        new_consumed.start_ticket = assigned.range_from
                    new_consumed.end_ticket = ticket_used["value"]
                    new_consumed.total = (float(new_consumed.end_ticket) - float(new_consumed.start_ticket)) * 12
                    new_consumed.remittance_form = rem_form
                    new_consumed.save()

                    rem_form.total += new_consumed.total

                    if assigned.range_to == new_consumed.end_ticket:
                        assigned.is_consumed = True
                        assigned.save()

        for ticket_used in data["fifteen_peso_tickets"]:
            assigned = AssignedTicket.objects.get(id=ticket_used["id"])

            if "value" in ticket_used:
                if ticket_used["value"]:
                    # Get current tickets
                    consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=assigned)
                    last_consumed = consumed_tickets.order_by('-end_ticket').first()

                    new_consumed = ConsumedTicket()
                    new_consumed.assigned_ticket = assigned
                    if last_consumed is not None:
                        new_consumed.start_ticket = last_consumed.end_ticket + 1
                    else:
                        new_consumed.start_ticket = assigned.range_from
                    new_consumed.end_ticket = ticket_used["value"]
                    new_consumed.total = (float(new_consumed.end_ticket) - float(new_consumed.start_ticket)) * 15
                    new_consumed.remittance_form = rem_form
                    new_consumed.save()

                    rem_form.total += new_consumed.total

                    if assigned.range_to == new_consumed.end_ticket:
                        assigned.is_consumed = True
                        assigned.save()

        rem_form.total -= (float(rem_form.fuel_cost) + float(rem_form.other_cost))
        deployment.shuttle.save()
        if deployment.status is not "F":
            if deployment.status is "O":
                deployment.end_time = datetime.now()
                deployment.result = 'S'
            deployment.status = 'F'
            deployment.save()
        rem_form.save()

        serialized_rem_form = RemittanceFormSerializer(rem_form)
        return Response(data={
            "remittance_form": serialized_rem_form.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def isTicketsValid(tickets):
        valid = True
        for ticket in tickets:
            assigned = AssignedTicket.objects.get(id=ticket["id"])

            if "value" in ticket:
                val = ticket["value"]
                consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=assigned)
                last_consumed = consumed_tickets.order_by('-end_ticket').first()

                if last_consumed is not None:
                    if int(val) <= last_consumed.end_ticket or int(val) > assigned.range_to:
                        valid = False
                else:
                    if int(val) < assigned.range_from or int(val) > assigned.range_to:
                        valid = False

        return valid

    @staticmethod
    def isMileageValid(mileage, shuttle):
        if int(mileage) <= shuttle.mileage:
            return False
        return True


class ScheduledDrivers(APIView):
    @staticmethod
    def get(request, supervisor_id):
        active_sched = Schedule.objects.get(start_date__lte=datetime.now().date(), end_date__gte=datetime.now().date())
        current_shift = Shift.objects.get(schedule=active_sched.id, supervisor=supervisor_id)
        shift_iteration = ShiftIteration.objects.filter(shift=current_shift.id, date=datetime.now().date()).first()

        query = DriversAssigned.objects.filter(shift=current_shift.id)
        print(f'the shift is {current_shift.type} and the time is {datetime.now().hour}')
        is_disabled = False
        if current_shift.type == "A" and datetime.now().hour > 15:
            print("disabled AM")
            is_disabled = True
            return Response(data={
                "drivers": [],
                "is_disabled": "Yes"
            }, status=status.HTTP_200_OK)
        if current_shift.type == "P" and datetime.now().hour > 23:
            is_disabled = True
            print("disabled AM")
            return Response(data={
                "drivers": [],
                "is_disabled": "Yes"
            }, status=status.HTTP_200_OK)
        drivers = list()
        for driver in DriversAssigned.objects.filter(shift=current_shift.id):
            timeIn = None
            for present in PresentDrivers.objects.filter(
                    datetime__year=datetime.now().year,
                    datetime__month=datetime.now().month,
                    datetime__day=datetime.now().day
            ):
                if driver.id == present.assignedDriver.id and present.is_dayoff == False:
                    timeIn = present.datetime.strftime("%r")

            drivers.append({
                "name": driver.driver.name,
                "timeIn": timeIn
            })

        return Response(data={
            "drivers": sorted(drivers, key=lambda k: k['name']),
            "is_disabled": "No"
        }, status=status.HTTP_200_OK)


class ShuttleMileage(APIView):
    @staticmethod
    def get(request, deployment_id):
        deployment = Deployment.objects.get(id=deployment_id)

        mileage = deployment.shuttle.mileage

        return Response(data={
            'mileage': "{:,}".format(mileage)
        }, status=status.HTTP_200_OK)


class PendingRemittances(APIView):
    @staticmethod
    def get(request, supervisor_id):
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by(
            "-date").first()

        # only serialize those that have pending remittances
        to_serialize = []
        
        remittances = RemittanceForm.objects.filter(deployment__shift_iteration__shift__supervisor=supervisor_id, status='P')

        for remittance in remittances:
            to_serialize.append(remittance.deployment)

        deployments_serializer = DeploymentSerializer(to_serialize, many=True)

        # INSERT NEEDED DATA FOR LIST
        for item in deployments_serializer.data:
            driver = DriverSerializer(Driver.objects.get(id=item.get('driver')))
            shuttle = ShuttlesSerializer(Shuttle.objects.get(id=item.get('shuttle')))
            deployment = Deployment.objects.get(id=item["id"]);
            start_time = deployment.start_time
            end_time = deployment.end_time

            item["driver"] = driver.data
            item["shuttle"] = shuttle.data
            item["start_time"] = start_time.strftime("%I:%M %p")
            item["end_time"] = end_time.strftime("%I:%M %p")
            item["route"] = deployment.route
            item["date"] = start_time.strftime("%m-%d-%Y")

            if DeployedDrivers.is_sub(item['id']):
                sub_deployment = SubbedDeployments.objects.filter(deployment_id=item['id']).get()
                absent_driver_id = sub_deployment.absent_driver.driver.id
                absent_driver_obj = DriverSerializer(Driver.objects.get(id=absent_driver_id))
                item["absent_driver"] = absent_driver_obj.data

        return Response(data={
            'deployments': deployments_serializer.data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, remittance_id):
        data = json.loads(request.body);

        rem_form = RemittanceForm.objects.get(id=remittance_id)
        rem_form.discrepancy = abs(float(data["actual"]) - float(rem_form.total))
        rem_form.status = 'C'
        rem_form.save()

        return Response(data={
            "remittance_form": [],
        }, status=status.HTTP_200_OK)


class ViewRemittance(APIView):
    @staticmethod
    def get(request, deployment_id):
        deployment = Deployment.objects.get(id=deployment_id)

        rem_form = RemittanceForm.objects.get(deployment=deployment)

        ten_tickets = ViewRemittance.getTickets('A', rem_form)
        twelve_tickets = ViewRemittance.getTickets('B', rem_form)
        fifteen_tickets = ViewRemittance.getTickets('C', rem_form)

        serialized_remittance = RemittanceFormSerializer(rem_form)

        return Response(data={
            "remittance_form": serialized_remittance.data,
            "ten_tickets": ten_tickets,
            "twelve_tickets": twelve_tickets,
            "fifteen_tickets": fifteen_tickets
        }, status=status.HTTP_200_OK)

    @staticmethod
    def getTickets(ticket_type, remittance_form):
        tickets = ConsumedTicket.objects.filter(
            remittance_form=remittance_form,
            assigned_ticket__type=ticket_type
        )

        data = []

        for ticket in tickets:
            data.append({
                "id": ticket.id,
                "start_ticket": ticket.start_ticket,
                "end_ticket": ticket.end_ticket,
                "total": ticket.total
            })

        return data


class ViewRemittancePerSupervisor(APIView):
    @staticmethod
    def get(request, supervisor_id):
        deployment_list = []

        deployments = [item for item in Deployment.objects.all() if
                       item.shift_iteration.shift.supervisor.id == supervisor_id]
        # for deployment in deployments:
        #     rem_form = RemittanceForm.objects.get(deployment=deployment)
        #     ten_tickets = ViewRemittance.getTickets('A', rem_form)
        #     twelve_tickets = ViewRemittance.getTickets('B', rem_form)
        #     fifteen_tickets = ViewRemittance.getTickets('C', rem_form)
        #     deployment_list.append({
        #         "remittance_form": RemittanceFormSerializer(rem_form),
        #         "supervisor": deployment.shift_iteration.shift.supervisor.id,
        #         "deployment": DeploymentSerializer(deployment).data,
        #         "ten_tickets": ten_tickets,
        #         "twelve_tickets": twelve_tickets,
        #         "fifteen_tickets": fifteen_tickets
        #     })

        return Response(data={
            "deployments": DeploymentSerializer(deployments, many=True).data
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

    @staticmethod
    def get_recent_shift_iteration_of_driver(driver_id):
        shift_iterations = ShiftIteration.objects.all().order_by("-date")

        for shift_iteration in shift_iterations:
            deployments = Deployment.objects.filter(shift_iteration=shift_iteration)

            for deployment in deployments:
                if deployment.driver.id == driver_id:
                    return shift_iteration.id

        return None


class SpecificDriverTicket(APIView):
    @staticmethod
    def get(request, driver_id):
        tickets = TicketUtilities.get_assigned_with_void_of_driver(driver_id)

        ten_peso_tickets = list()
        twelve_peso_tickets = list()
        fifteen_peso_tickets = list()

        ten_total = 0
        twelve_total = 0
        fifteen_total = 0

        for ticket in tickets:
            if ticket["ticket_type"] == '10 Pesos':
                ten_total += ticket["range_to"] - ticket["range_from"] + 1
                ten_peso_tickets.append(ticket)
            elif ticket["ticket_type"] == '12 Pesos':
                twelve_total += ticket["range_to"] - ticket["range_from"] + 1
                twelve_peso_tickets.append(ticket)
            else:
                fifteen_total += ticket["range_to"] - ticket["range_from"] + 1
                fifteen_peso_tickets.append(ticket)

        return Response(data={
            "ten_total": ten_total,
            "twelve_total": twelve_total,
            "fifteen_total": fifteen_total,
            "ten_peso_tickets": ten_peso_tickets,
            "twelve_peso_tickets": twelve_peso_tickets,
            "fifteen_peso_tickets": fifteen_peso_tickets,
        }, status=status.HTTP_200_OK)


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
        deployment = Deployment.objects.get(id=deployment_id)
        tickets = AssignedTicket.objects.filter(driver=deployment.driver.id)

        final = []

        for ticket in tickets:
            # remove consumed tickets
            # retrieve highest end ticket for the bundle
            consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=ticket.id).order_by("-end_ticket").first()

            if consumed_tickets is not None:
                # check if all tickets in bundle are consumed
                if ticket.range_to == consumed_tickets.end_ticket:
                    voids = []
                    number_of_voids = 0
                    for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                        voids.append({"ticket_number": void_ticket.ticket_number})
                        number_of_voids += 1

                    # change range_from to a ticket that hasn't been consumed
                    range_from = consumed_tickets.end_ticket + 1

                    final.append({
                        "ticket_id": ticket.id,
                        "driver_id": ticket.driver.id,
                        "driver_name": ticket.driver.name,
                        "ticket_type": ticket.get_type_display(),
                        "range_from": range_from,
                        "range_to": ticket.range_to,
                        "number_of_voids": number_of_voids,
                        "voids": voids
                    })
            else:
                voids = []
                number_of_voids = 0
                for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                    voids.append({"ticket_number": void_ticket.ticket_number})
                    number_of_voids += 1

                final.append({
                    "ticket_id": ticket.id,
                    "driver_id": ticket.driver.id,
                    "driver_name": ticket.driver.name,
                    "ticket_type": ticket.get_type_display(),
                    "range_from": ticket.range_from,
                    "range_to": ticket.range_to,
                    "number_of_voids": number_of_voids,
                    "voids": voids
                })

        return final

    # this function returns current ticket details of the said driver
    @staticmethod
    def get_assigned_with_void_of_driver(driver_id):
        tickets = AssignedTicket.objects.filter(driver=driver_id)

        final = []

        for ticket in tickets:
            # remove consumed tickets
            # retrieve highest end ticket for the bundle
            consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=ticket.id).order_by("-end_ticket").first()

            if consumed_tickets is not None:
                # check if all tickets in bundle are consumed
                if ticket.range_to > consumed_tickets.end_ticket:
                    voids = []
                    number_of_voids = 0
                    for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                        voids.append({"ticket_number": void_ticket.ticket_number})
                        number_of_voids += 1

                    # change range_from to a ticket that hasn't been consumed
                    range_from = consumed_tickets.end_ticket + 1
                    print(ticket.range_to, consumed_tickets.end_ticket)
                    final.append({
                        "ticket_id": ticket.id,
                        "driver_id": ticket.driver.id,
                        "driver_name": ticket.driver.name,
                        "ticket_type": ticket.get_type_display(),
                        "range_from": range_from,
                        "range_to": ticket.range_to,
                        "number_of_voids": number_of_voids,
                        "voids": voids
                    })
            else:
                voids = []
                number_of_voids = 0
                for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                    voids.append({"ticket_number": void_ticket.ticket_number})
                    number_of_voids += 1

                final.append({
                    "ticket_id": ticket.id,
                    "driver_id": ticket.driver.id,
                    "driver_name": ticket.driver.name,
                    "ticket_type": ticket.get_type_display(),
                    "range_from": ticket.range_from,
                    "range_to": ticket.range_to,
                    "number_of_voids": number_of_voids,
                    "voids": voids
                })

        return final

    # this function returns a summary of ticket details with consumed and total for each batch
    @staticmethod
    def get_consumed_with_assigned(deployment_id):
        deployment = Deployment.objects.get(id=deployment_id)
        print(deployment.pk)
        remittance_form = RemittanceForm.objects.get(deployment=deployment)
        consumed_tickets = ConsumedTicket.objects.filter(remittance_form=remittance_form)

        final = []

        for ticket in consumed_tickets:
            voids = []
            number_of_voids = 0
            for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket.assigned_ticket):
                # only consider void tickets that are in range of consumed tickets for deployment
                if void_ticket.ticket_number >= ticket.start_ticket and void_ticket.ticket_number <= ticket.end_ticket:
                    voids.append({"ticket_number": void_ticket.ticket_number})
                    number_of_voids += 1

            final.append({
                "assigned_ticket_id": ticket.assigned_ticket_id,
                "start_ticket": ticket.start_ticket,
                "assigned_range_to": ticket.assigned_ticket.range_to,
                "consumed_end": ticket.end_ticket,
                "number_of_void": number_of_voids,
                "void_tickets": voids,
                "ticket_type": ticket.assigned_ticket.type,
                "total": ticket.total
            })

        print(f'the tickets are {final}')
        # I dont want to change front-end too much
        ten_peso = []
        twelve_peso = []
        fifteen_peso = []
        for item in final:
            if item["ticket_type"] == "A":
                ten_peso.append(item)
            elif item["ticket_type"] == "B":
                twelve_peso.append(item)
            else:
                fifteen_peso.append(item)

        # get last 2 items of array (most recent ones)
        ten_peso = DeploymentDetails.get_recent_tickets_confirm(ten_peso)
        twelve_peso = DeploymentDetails.get_recent_tickets_confirm(twelve_peso)
        fifteen_peso = DeploymentDetails.get_recent_tickets_confirm(fifteen_peso)

        assigned_tickets = [
            ten_peso[0],
            ten_peso[1],
            twelve_peso[0],
            twelve_peso[1],
            fifteen_peso[0],
            fifteen_peso[1],
        ]

        return assigned_tickets

    # this function returns all the deployment details w/ remittances for the shift iteration
    @staticmethod
    def get_remittances_per_deployment(shift_iteration_id):
        deployments = Deployment.objects.filter(shift_iteration=shift_iteration_id)
        final = list()

        for deployment in deployments:
            deployment_details = TicketUtilities.get_consumed_with_assigned(deployment.id)
            remittance_details = RemittanceForm.objects.get(deployment=deployment)
            remittance = ReadRemittanceSerializer(remittance_details)
            photo = deployment.driver.photo.url if deployment.driver.photo else None
            final.append({
                'deployment_id': deployment.id,
                'driver': deployment.driver.name,
                'driver_photo': photo,
                'ticket_specifics': deployment_details,
                'remittance_details': remittance.data
            })

        return final


class ShiftView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = start_date + timedelta(days=6)
        supervisor_id = data['id']
        shifts = []
        shift_iterations = ShiftIteration.objects.filter(date__gte=start_date, date__lte=end_date,
                                                         shift__supervisor=supervisor_id).order_by("-date")

        for shift_iteration in shift_iterations:
            shift_data = {
                'shift': ShiftSerializer(shift_iteration.shift).data,
                'shift_iteration': ShiftIterationSerializer(shift_iteration).data
            }
            shifts.append(shift_data)

        return Response(data={
            "shifts": shifts
        }, status=status.HTTP_200_OK)


class GeneralShiftView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        if "end_date" in request.data:
            end_date = datetime.strptime(request.data["end_date"], '%Y-%m-%d')
        else:
            end_date = start_date + timedelta(days=6)

        supervisors = [item for item in Driver.objects.all() if item.is_supervisor]
        shifts = []

        for supervisor in supervisors:
            shift_iterations = ShiftIteration.objects.filter(date__gte=start_date, date__lte=end_date,
                                                             shift__supervisor=supervisor.id).order_by("-date")

            for shift_iteration in shift_iterations:
                shift_data = {
                    'shift': ShiftSerializer(shift_iteration.shift).data,
                    'shift_iteration': ShiftIterationSerializer(shift_iteration).data
                }
                shifts.append(shift_data)

        return Response(data={
            "shifts": shifts
        }, status=status.HTTP_200_OK)


class ShiftRemarks(APIView):
    @staticmethod
    def get(request, supervisor_id):
        shift_iteration = RemittanceUtilities.get_shift_iteration_sup(supervisor_id=supervisor_id)

        if shift_iteration.remarks is not None:
            return Response(data={
                "remarks": shift_iteration.remarks
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "remarks": "No Remarks"
            }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
        shift_iteration = RemittanceUtilities.get_shift_iteration_sup(supervisor_id=data['supervisor'])
        print(data['remarks'])
        shift_iteration.remarks = data['remarks']
        shift_iteration.save()

        return Response(data={
            "shift_iteration_id": shift_iteration.id,
            "remarks": shift_iteration.remarks
        }, status=status.HTTP_200_OK)


class PreDeploymentDetails(APIView):
    @staticmethod
    def get(request, driver_id):
        tickets = AssignedTicket.objects.filter(driver=driver_id)

        final = []

        for ticket in tickets:
            # remove consumed tickets
            # retrieve highest end ticket for the bundle
            consumed_tickets = ConsumedTicket.objects.filter(assigned_ticket=ticket.id).order_by("-end_ticket").first()

            if consumed_tickets is not None:
                # check if all tickets in bundle are consumed
                if ticket.range_to > consumed_tickets.end_ticket:
                    voids = []
                    number_of_voids = 0
                    for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                        voids.append({"ticket_number": void_ticket.ticket_number})
                        number_of_voids += 1

                    # change range_from to a ticket that hasn't been consumed
                    range_from = consumed_tickets.end_ticket + 1

                    final.append({
                        "ticket_id": ticket.id,
                        "driver_id": ticket.driver.id,
                        "driver_name": ticket.driver.name,
                        "ticket_type": ticket.get_type_display(),
                        "range_from": range_from,
                        "range_to": ticket.range_to,
                        "number_of_voids": number_of_voids,
                        "voids": voids
                    })
            else:
                voids = []
                number_of_voids = 0
                for void_ticket in VoidTicket.objects.filter(assigned_ticket=ticket):
                    voids.append({"ticket_number": void_ticket.ticket_number})
                    number_of_voids += 1

                final.append({
                    "ticket_id": ticket.id,
                    "driver_id": ticket.driver.id,
                    "driver_name": ticket.driver.name,
                    "ticket_type": ticket.get_type_display(),
                    "range_from": ticket.range_from,
                    "range_to": ticket.range_to,
                    "number_of_voids": number_of_voids,
                    "voids": voids
                })

        return Response(data={
            "ticket_details": final
        }, status=status.HTTP_200_OK)


class DeploymentDetails(APIView):
    # to get deployment data of the driver for today
    # this expects that a driver could only be deployed once a day
    # change the algorithm if the driver could be deployed more than once
    @staticmethod
    def get(request, driver_id):
        # shift = RemittanceUtilities.get_shift_of_driver(driver_id)
        # shift_iteration = RemittanceUtilities.get_shift_iteration(shift.id)
        shift_iteration = RemittanceUtilities.get_recent_shift_iteration_of_driver(driver_id)
        deployment_query = Deployment.objects.get(shift_iteration=shift_iteration, driver=driver_id)
        deployment = DeploymentSerializer(deployment_query)
        assigned_tickets = TicketUtilities.get_tickets_with_void(deployment_query.id)

        # I dont want to change front-end too much
        ten_peso = []
        twelve_peso = []
        fifteen_peso = []
        for item in assigned_tickets:
            if item["ticket_type"] == "10 Pesos":
                ten_peso.append(item)
            elif item["ticket_type"] == "12 Pesos":
                twelve_peso.append(item)
            else:
                fifteen_peso.append(item)

        # get last 2 items of array (most recent ones)
        ten_peso = DeploymentDetails.get_recent_tickets(ten_peso)
        twelve_peso = DeploymentDetails.get_recent_tickets(twelve_peso)
        fifteen_peso = DeploymentDetails.get_recent_tickets(fifteen_peso)

        assigned_tickets = [
            ten_peso[0],
            ten_peso[1],
            twelve_peso[0],
            twelve_peso[1],
            fifteen_peso[0],
            fifteen_peso[1],
        ]
        print(assigned_tickets)

        return Response(data={
            'deployment_details': deployment.data,
            'assigned_tickets': assigned_tickets,
        }, status=status.HTTP_200_OK)

    @staticmethod
    def get_recent_tickets(array):
        final = []
        print(f'the array is {array}')
        try:
            first = array[-1]
        except IndexError:
            first = None

        try:
            second = array[-2]
        except IndexError:
            second = {"ticket_id": first["ticket_id"],
                      "driver_id": first["driver_id"] if first["driver_id"] else None,
                      "driver_name": first["driver_name"] if first["driver_name"] else None,
                      "ticket_type": first["ticket_type"],
                      "range_from": 0,
                      "range_to": 0,
                      "number_of_voids": 0,
                      "voids": []}
        final = [first, second]
        print(array)
        print(final)

        return final

    @staticmethod
    def get_recent_tickets(array):
        final = []
        print(f'the array is {array}')
        try:
            first = array[-1]
        except IndexError:
            first = None

        try:
            second = array[-2]
        except IndexError:
            second = {"ticket_id": first["ticket_id"],
                      "driver_id": first["driver_id"] if first["driver_id"] else None,
                      "driver_name": first["driver_name"] if first["driver_name"] else None,
                      "ticket_type": first["ticket_type"],
                      "range_from": 0,
                      "range_to": 0,
                      "number_of_voids": 0,
                      "voids": []}
        final = [first, second]
        print(array)
        print(final)

        return final

    def get_recent_tickets_confirm(array):
        final = []
        if len(array) == 0:
            return [
                {"ticket_id": None,
                 "driver_id": None,
                 "driver_name": None,
                 "ticket_type": 'A',
                 "range_from": 0,
                 "range_to": 0,
                 "number_of_voids": 0,
                 "voids": [],
                 }, {"ticket_id": None,
                     "driver_id": None,
                     "driver_name": None,
                     "ticket_type": 'A',
                     "range_from": 0,
                     "range_to": 0,
                     "number_of_voids": 0,
                     "voids": [],
                     }, ]
            print(f'the array is {array}')
        try:
            first = array[-1]
        except IndexError:
            first = None

        try:
            second = array[-2]
        except IndexError:
            if first["assigned_ticket_id"] is not None:
                first["ticket_id"] = first["assigned_ticket_id"]

            first["driver_id"] = None
            first["driver_name"] = None

            second = {"ticket_id": first["ticket_id"],
                      "driver_id": first["driver_id"] if first["driver_id"] else None,
                      "driver_name": first["driver_name"] if first["driver_name"] else None,
                      "ticket_type": first["ticket_type"],
                      "range_from": 0,
                      "range_to": 0,
                      "number_of_voids": 0,
                      "voids": []}
        final = [first, second]
        print(array)
        print(final)

        return final


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
        data["fuel_receipt"] = "OR2341"

        # insert validation

        remittance_form = RemittanceForm()
        remittance_form.deployment_id = data["deployment"]
        remittance_form.fuel_cost = float(data["fuel_cost"])
        remittance_form.fuel_receipt = data["fuel_receipt"]
        remittance_form.other_cost = float(data["other_cost"])

        # get km_from from shuttle mileage
        deployment = Deployment.objects.get(id=data["deployment"])
        shuttle = Shuttle.objects.get(id=deployment.shuttle_id)

        remittance_form.km_from = shuttle.mileage
        remittance_form.km_to = data["km_to"]
        shuttle.mileage = data["km_to"]
        shuttle.save()
        remittance_form.save()

        # compute total
        remittance_total = 0
        for consumed_ticket in data["consumed_ticket"]:
            assigned_ticket = AssignedTicket.objects.get(id=consumed_ticket["assigned_ticket"])
            # get range_from
            previous = ConsumedTicket.objects.filter(assigned_ticket=assigned_ticket.id).order_by(
                "-end_ticket").first()

            new_consumed = ConsumedTicket()
            new_consumed.remittance_form_id = remittance_form.id
            new_consumed.assigned_ticket_id = consumed_ticket["assigned_ticket"]
            new_consumed.end_ticket = consumed_ticket["end_ticket"]

            if assigned_ticket.range_from is not None:
                if previous is not None:
                    new_consumed.start_ticket = previous.end_ticket + 1
                else:
                    new_consumed.start_ticket = assigned_ticket.range_from

                    # get number of voids to subtract to total
                voided = 0  # number of voided tickets
                void_tickets = VoidTicket.objects.filter(assigned_ticket=assigned_ticket.id)
                void_tickets = [item for item in void_tickets if item.ticket_number <= consumed_ticket["end_ticket"]]
                for void_ticket in void_tickets:
                    voided += 1

                # get ticket type to multiply for total
                if assigned_ticket.type == "A":
                    type = 10
                elif assigned_ticket.type == "B":
                    type = 12
                else:
                    type = 15

                    # compute total
                if new_consumed.end_ticket != 0:
                    if previous is not None:
                        # another +1 for next ticket
                        total = (int(new_consumed.end_ticket) - previous.end_ticket - voided + 2) * type
                    else:
                        print(int(new_consumed.end_ticket))
                        total = (int(new_consumed.end_ticket) - assigned_ticket.range_from - voided + 1) * type

                new_consumed.total = total
                new_consumed.save()
                remittance_total += total

        # subtract remittance total to costs accumulated during deployment
        remittance_form.total = remittance_total - (remittance_form.fuel_cost + remittance_form.other_cost)
        remittance_form.save()

        # update deployment data to finished
        deployment = Deployment.objects.get(id=remittance_form.deployment_id)
        deployment.status = 'F'
        deployment.end_deployment()
        deployment.save()

        return Response(data={
            "message": "Remittance Form Submitted",
            "remittance_id": remittance_form.id,
            "remittance_total": remittance_form.total
        }, status=status.HTTP_200_OK)

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
            "current_iteration": ShiftIterationSerializer(current_iteration).data,
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
        rem_form.discrepancy = (data['discrepancy'])
        # rem_form.total = float(rem_form.total) - float(rem_form.discrepancy)
        # rem_form.total = rem_form.total - rem_form.discrepancy
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

    @staticmethod
    def get_report_items(deployments):
        report_items = []
        for deployment in deployments:
            shift = deployment.shift_iteration.shift.id
            driver = deployment.driver.name
            rem = RemittanceForm.objects.get(deployment=deployment)
            date = deployment.shift_iteration.date
            da = DriversAssigned.objects.get(shift=shift, driver=deployment.driver.id)
            report_items.append({
                "shift": shift,
                "shuttle": da.shuttle.plate_number,
                "driver": driver,
                "remittance": rem.id,
                "date": date,
                "shift_type": deployment.shift_iteration.shift.type,
                "total": rem.total
            })
        return report_items


class ShiftIterationReport(APIView):
    @staticmethod
    def get(request):
        shift_iterations = ShiftIteration.objects.filter(status='F')
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
        # shift_iteration = RemittanceUtilities.get_shift_iteration_sup(data['supervisor_id'])
        shift_iteration = ShiftIteration.objects.get(pk=data["iteration_id"])
        shift_iteration.finish_shift()
        print(shift_iteration.status)
        return Response(data={
            'iteration_id': shift_iteration.id,
            'iteration_status': shift_iteration.status
        }, status=status.HTTP_200_OK)


class BeepTransactionView(APIView):
    temp_shift = None
    temp_shuttle = None

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
        print(beep_shifts)
        return Response(data={
            "beep_shifts": beep_shifts
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        print(request.data)
        # autodetect shift if not present
        if request.POST.get('date') == "null":
            date = datetime.now().date()
        else:
            date = datetime.strptime(request.POST.get('date'), '%Y-%m-%d').date()
        if request.POST.get('shift_type') == "null":
            is_am = BeepTransactionView.is_time_between(time(2, 00), time(14, 00))
            if is_am:
                shift_type = "A"
            else:
                shift_type = "P"
        else:
            shift_type = request.POST.get('shift_type')

        function = request.POST.get('function')
        beep_shift = BeepTransactionView.shift_get_or_create(date, shift_type)
        shuttle = Shuttle.objects.order_by("?").first()
        if function == 'replace':
            [item.delete() for item in BeepTransaction.objects.all() if item.shift == beep_shift]

        BeepTransactionView.temp_shift = beep_shift
        BeepTransactionView.temp_shuttle = shuttle
        beep_resource = BeepTransactionResource()
        dataset = Dataset()
        new_transactions = request.FILES['file']
        imported_data = dataset.load(new_transactions.read().decode('utf-8'), format='csv')
        dataset.append_col(BeepTransactionView.generate_column, header="shift")
        dataset.append_col(BeepTransactionView.generate_shuttle_column, header="shuttle")

        print(dataset)
        result = beep_resource.import_data(dataset, dry_run=True)  # Test the data import
        if not result.has_errors():
            beep_resource.import_data(dataset, dry_run=False)  # Actually import now

        return Response(data={
            "data": "it worked"
        }, status=status.HTTP_200_OK)

    @staticmethod
    def is_time_between(begin_time, end_time, check_time=None):
        # If check time is not given, default to current UTC time
        check_time = datetime.now().time()
        if begin_time < end_time:
            return check_time >= begin_time and check_time <= end_time
        else:  # crosses midnight
            return check_time >= begin_time or check_time <= end_time

    @staticmethod
    def generate_column(row):
        return BeepTransactionView.temp_shift.id

    @staticmethod
    def generate_shuttle_column(row):
        return BeepTransactionView.temp_shuttle.id

    @staticmethod
    def shift_get_or_create(date, shift_type):
        for shift in BeepShift.objects.all():
            print(shift.date == date)
            if shift.date == date and shift.type == shift_type:
                print("its the same")
                return shift
        print("not the same")
        beep_shift = BeepShift()
        beep_shift.type = shift_type
        beep_shift.date = date
        beep_shift.save()
        return beep_shift


class BeepCollapsedView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)
        print("enters here")
        beep_shifts = []
        print('start_date' not in request.data)
        print('end_date' not in request.data)
        if 'start_date' not in request.data:
            start_date = datetime.now() - timedelta(days=30)
        else:
            start_date = data['start_date']
        if 'end_date' not in request.data:
            end_date = datetime.now()
        else:
            end_date = data['end_date']

        shifts = BeepShift.objects.filter(date__gte=start_date, date__lte=end_date)

        if 'start_date' in request.data and 'end_date' not in request.data:
            shifts = BeepShift.objects.filter(date=start_date)

        for shift in shifts:
            transactions = BeepTransaction.objects.filter(shift=shift.id)
            total = sum([item.total for item in transactions])
            # dict_transactions = []
            # transactions = [BeepTransactionSerializer(item) for item in BeepTransaction.objects.all() if
            #                 item.shift.id == shift.id]
            # for transaction in transactions:
            #     transaction_instance = transaction.data
            #     try:
            #         card = IDCards.objects.get(can=int(transaction_instance["card_number"]))
            #     except ObjectDoesNotExist:
            #         card = None
            #     if card is not None:
            #         member = card.member
            #         transaction_instance["member"] = MemberSerializer(member).data
            #     else:
            #         transaction_instance["member"] = None
            #
            #     does_exist = False
            #     for item in dict_transactions:
            #         if transaction_instance['card_number'] == item['card_number']:
            #             item['total'] = float(item['total']) + float(transaction_instance['total'])
            #             does_exist = True
            #
            #     if not does_exist:
            #         dict_transactions.append(transaction_instance)

            # sum([float(item["total"]) for item in dict_transactions])
            beep_shifts.append({
                "total": total,
                "shift": BeepShiftSerializer(shift).data,
                # "transactions": dict_transactions
            })
        return Response(data={
            "beep_shifts": reversed(beep_shifts)
        }, status=status.HTTP_200_OK)


class SpecificBeepView(APIView):
    @staticmethod
    def get(request, beep_shift_id):
        print("enters here")
        dict_transactions = []
        transactions = [BeepTransactionSerializer(item) for item in
                        BeepTransaction.objects.filter(shift__id=beep_shift_id)]
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

            does_exist = False
            for item in dict_transactions:
                if transaction_instance['card_number'] == item['card_number']:
                    item['total'] = float(item['total']) + float(transaction_instance['total'])
                    does_exist = True

            if not does_exist:
                dict_transactions.append(transaction_instance)

        return Response(data={
            "transactions": dict_transactions,
        }, status=status.HTTP_200_OK)


class CarwashTransactionView(APIView):
    @staticmethod
    def get(request, member_id):
        print("enters here")
        transactions = CarwashTransaction.objects.all().order_by("date")
        start_date = datetime.now()
        end_date = start_date - timedelta(days=90)
        carwash_transactions = CarwashTransaction.objects.filter(member__id=member_id, date__gte=end_date,
                                                                 date__lte=start_date)
        serialized_carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions]
        return Response(data={
            "carwash_transactions": reversed(serialized_carwash_transactions),
            "carwash_transaction_total": sum([float(item["total"]) for item in serialized_carwash_transactions])
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):

        data = {
            "date": request.POST.get('date'),
            "member": request.POST.get('member'),
            "receipt": request.POST.get('receipt'),
            "total": request.POST.get('total'),
        }
        # "photo": request.FILES.get('image')

        print(data['date'])
        if data['date'] == "now":
            data['date'] = datetime.now().date()
        transaction_serializer = CarwashTransactionSerializer(data=data)
        if transaction_serializer.is_valid():
            transaction = transaction_serializer.create(validated_data=transaction_serializer.validated_data)
            return Response(data={
                "carwash_transaction": CarwashTransactionSerializer(transaction).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={
                "errors": transaction_serializer.errors
            })

class CarwashTransactionWithFilterView(APIView):
    @staticmethod
    def post(request, member_id):
        print("enters here")
        data = json.loads(request.data)
        transactions = CarwashTransaction.objects.all().order_by("date")
        start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
        end_date = datetime.strptime(data["end_date"], '%Y-%m-%d')
        carwash_transactions = CarwashTransaction.objects.filter(member__id=member_id, date__gte=start_date,
                                                                 date__lte=end_date)
        serialized_carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions]
        return Response(data={
            "carwash_transactions": reversed(serialized_carwash_transactions),
            "carwash_transaction_total": sum([float(item["total"]) for item in serialized_carwash_transactions])
        }, status=status.HTTP_200_OK)
