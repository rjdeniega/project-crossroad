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
from datetime import datetime
from tablib import Dataset
from time import time

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
            "expected_start_date": start_date,
            "expected_end_date": end_date
        }, status=status.HTTP_200_OK)


class CreateSchedule(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

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
                'schedule_status': schedule.get_status(active_schedule),
                'shifts': tempshifts
            })

        return Response(data={
            "schedule_history": schedulehistory
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


class AssignTicketView(APIView):
    @staticmethod
    def post(request):
        data = json.loads(request.body)

        assigned_ticket = AssignedTicket()
        assigned_ticket.driver_id = data['driver_id']
        assigned_ticket.range_from = data['range_from']
        temp_string = int(data['range_from']) + 100 - 1
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

        print(saved_data)
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

        for driver in query:
            if NonDeployedDrivers.did_deploy_a_sub(driver.id, shift_iteration.id):
                query = query.exclude(driver=driver.driver.id)

        non_deployed_drivers = PlannedDriversSerializer(query, many=True)
        for item in non_deployed_drivers.data:
            item["driver"]["shuttle_id"] = item["shuttle"]["id"]
            item["driver"]["shuttle_plate_number"] = item["shuttle"]["plate_number"]

            if item['deployment_type'] is 'E' and item['shift']['type'] is 'A':
                item['expected_departure'] = "5:00 AM"
            elif item['deployment_type'] is 'R' and item['shift']['type'] is 'A':
                item['expected_departure'] = "7:00 AM"
            elif item['deployment_type'] is 'R' and item['shift']['type'] is 'P':
                item['expected_departure'] = "2:00 PM"
            else:
                item['expected_departure'] = "10:00 PM"

        return Response(data={
            "non_deployed_drivers": non_deployed_drivers.data
        }, status=status.HTTP_200_OK)
    
    @staticmethod
    def did_deploy_a_sub(driver_id, shift_iteration_id):
        deployments = Deployment.objects.filter(shift_iteration_id=shift_iteration_id)
        print(driver_id)
        for deployment in deployments:
            subbed_deployment = SubbedDeployments.objects.filter(deployment=deployment, absent_driver_id=driver_id).first()
            
            if subbed_deployment:
                print(subbed_deployment)
                print("entered here")
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
        return Response(data={
            "sub_drivers": drivers_assigned.data
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
                driver_id = driver_id,
                shuttle_id = driver_assigned.shuttle.id,
                route = driver_assigned.shuttle.route,
                shift_iteration_id = iteration.id
            )

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
        
        #CREATE DEPLOYMENT
        if is_valid:
            deployment = Deployment.objects.create(
                driver_id = driver_id,
                shuttle_id = driver_assigned.shuttle.id,
                route = driver_assigned.shuttle.route,
                shift_iteration_id = iteration.id
            )

            sub_deployment = SubbedDeployments.objects.create(
                deployment = deployment,
                absent_driver = driver_assigned
            )

            serialized_deployment = DeploymentSerializer(deployment)

            return Response(data={
                'deployment': serialized_deployment.data
            }, status=status.HTTP_200_OK)

        else:
            return Response(data={
                "errors": error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        

class DeployedDrivers(APIView):
    # this function returns all ongoing deployments for the latest shift iteration of the supervisor
    @staticmethod
    def get(request, supervisor_id):
        current_shift_iteration = ShiftIteration.objects.filter(shift__supervisor=supervisor_id).order_by(
            "-date").first()
        deployments = Deployment.objects.filter(shift_iteration_id=current_shift_iteration.id, status='O')
        deployments_serializer = DeploymentSerializer(deployments, many=True)

        #INSERT NEEDED DATA FOR LIST
        for item in deployments_serializer.data:
            driver = DriverSerializer(Driver.objects.get(id=item.get('driver')))
            shuttle = ShuttlesSerializer(Shuttle.objects.get(id=item.get('shuttle')))
            deployment = Deployment.objects.get(id=item["id"]);
            time = deployment.start_time
            item["driver"] = driver.data
            item["shuttle"] = shuttle.data
            item["start_time"] = time.strftime("%I:%M %p") 

            if DeployedDrivers.is_sub(item['id']):
                sub_deployment = SubbedDeployments.objects.filter(deployment_id=item['id']).get()
                absent_driver_id = sub_deployment.absent_driver.driver.id
                absent_driver_obj = DriverSerializer(Driver.objects.get(id=absent_driver_id))
                item["absent_driver"] = absent_driver_obj.data

            
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
        deployment.end_deployment()

        shuttle.status = 'UM'
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
        return Response(data={
            "available_drivers": serialized_drivers.data
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
        deployment.end_deployment()

        serialized_deployment = DeploymentSerializer(new_deployment)

        return Response(data={
            "redeployment": serialized_deployment.data
        }, status=status.HTTP_200_OK)

class DriverDeployment(APIView):
    @staticmethod
    def get(request, driver_id):
        deployments = Deployment.objects.filter(driver_id=driver_id).reverse()

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
                'shuttle': shuttle
            })
        
        print(data)
        return Response(data={
            'deployments': data
        }, status=status.HTTP_200_OK)


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
        
        deployment = Deployment.objects.get(id=data["deployment_id"]);

        #create remittance form
        rem_form = RemittanceForm()
        rem_form.deployment = deployment
        if not data["fuel_costs"]:
            rem_form.fuel_cost = data["fuel_costs"]
        
        if not data["or_number"]:
            rem_form.fuel_receipt = data["or_number"]

        if not data["other_costs"]:
            rem_form.other_cost = data["other_costs"]
        
        rem_form.km_from = deployment.shuttle.mileage
        rem_form.km_to = data["mileage"]

        deployment.shuttle.mileage = data["mileage"]

        rem_form.save()

        for ticket_used in data["ten_peso_tickets"]:
            assigned = AssignedTicket.objects.get(id=ticket_used["id"])

            if not ticket_used["value"]:
                # Get current tickets
                consumed_tickets = ConsumedTickets.objects.filter(assigned_ticket=assigned)
                last_consumed = consumed_tickets.order_by('-end_tickets').first()

                new_consumed = ConsumedTicket()
                new_consumed.assigned_ticket = assigned
                new_consumed.start_ticket = last_consumed.end_ticket + 1
                new_consumed.end_ticket = ticket_used["value"]
                new_consumed.total = (new_consumed.end_ticket - new_consumed.start_ticket) * 10
                new_consumed.save()

                rem_form.total += new_consumed.total

                if assigned.range_to == new_consumed.end_ticket:
                    assigned.is_consumed = True
                    assigned.save()
        

        for ticket_used in data["twelve_peso_tickets"]:
            assigned = AssignedTicket.objects.get(id=ticket_used["id"])

            if not ticket_used["value"]:
                # Get current tickets
                consumed_tickets = ConsumedTickets.objects.filter(assigned_ticket=assigned)
                last_consumed = consumed_tickets.order_by('-end_tickets').first()

                new_consumed = ConsumedTicket()
                new_consumed.assigned_ticket = assigned
                new_consumed.start_ticket = last_consumed.end_ticket + 1
                new_consumed.end_ticket = ticket_used["value"]
                new_consumed.total = (new_consumed.end_ticket - new_consumed.start_ticket) * 12
                new_consumed.save()

                rem_form.total += new_consumed.total

                if assigned.range_to == new_consumed.end_ticket:
                    assigned.is_consumed = True
                    assigned.save()

        
        for ticket_used in data["fifteen_peso_tickets"]:
            assigned = AssignedTicket.objects.get(id=ticket_used["id"])

            if not ticket_used["value"]:
                # Get current tickets
                consumed_tickets = ConsumedTickets.objects.filter(assigned_ticket=assigned)
                last_consumed = consumed_tickets.order_by('-end_tickets').first()

                new_consumed = ConsumedTicket()
                new_consumed.assigned_ticket = assigned
                new_consumed.start_ticket = last_consumed.end_ticket + 1
                new_consumed.end_ticket = ticket_used["value"]
                new_consumed.total = (new_consumed.end_ticket - new_consumed.start_ticket) * 15
                new_consumed.save()

                rem_form.total += new_consumed.total

                if assigned.range_to == new_consumed.end_ticket:
                    assigned.is_consumed = True
                    assigned.save()

        deployment.shuttle.save()
        deployment.end_deployment()
        rem_form.save()

        serialized_rem_form = RemittanceFormSerializer(rem_form)
        return Response(data={
            "remittance_form": serialized_rem_form.data
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


class CarwashTransactionView(APIView):
    @staticmethod
    def get(request, member_id):
        print("enters here")
        transactions = CarwashTransaction.objects.all()
        carwash_transactions = [item for item in transactions if item.member.id == member_id]
        serialized_carwash_transactions = [CarwashTransactionSerializer(item).data for item in carwash_transactions]
        return Response(data={
            "carwash_transactions": serialized_carwash_transactions,
            "carwash_transaction_total": sum([float(item["total"]) for item in serialized_carwash_transactions])
        }, status=status.HTTP_200_OK)

    @staticmethod
    def post(request):
        data = json.loads(request.body)
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
