from datetime import timedelta
from remittances.models import *
from members.models import *


class PopulateRemittances():
    @staticmethod
    def main(start_date, end_date):
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        new_end_date = datetime.strptime(end_date, '%Y-%m-%d')
        pop = PopulateRemittances()

        while current_date <= new_end_date:
            sched = pop.create_schedule(current_date, current_date)

            temp_date = current_date


            while temp_date < current_date + timedelta(days=15):
                if temp_date > new_end_date:
                    break

                print(temp_date)
                #create deployments
                ctr = 0
                # there are twice the deployments in a day
                while ctr < 2:
                    if ctr == 0:
                        shift = Shift.objects.get(schedule=sched, type='A')
                    else:
                        shift = Shift.objects.get(schedule=sched, type='P')

                    shift_iteration = pop.start_shift_iteration(temp_date, shift)

                    # deploy drivers (submit remittance, confirm)
                    pop.deploy_drivers(shift_iteration, temp_date)

                    # finish shift iteration
                    shift_iteration.finish_shift()

                    ctr += 1

                temp_date = temp_date + timedelta(days=1)

            current_date = current_date + timedelta(days=15)

    @staticmethod
    def create_schedule(start_date, current_date):
        schedule = Schedule.objects.create(
            start_date=start_date,
            end_date=(start_date + timedelta(days=14)),
            created=current_date,
            modified=current_date
        )

        # create shifts for every schedule
        shifts = ['A', 'P']

        supervisor_ids = [1, 2]
        driver_ids_odd = [3, 4, 5, 6, 7, 8, 9]
        driver_ids_even = [10, 11, 12, 13, 14, 15, 16]

        ctr = 1
        for shift in shifts:
            supervisor = Driver.objects.get(id=supervisor_ids[ctr-1])

            if ctr % 2 == 0:
                drivers = driver_ids_even
            else:
                drivers = driver_ids_odd

            PopulateRemittances.create_shift(
                schedule=schedule,
                type=shift,
                current_date=current_date,
                supervisor=supervisor,
                drivers=drivers
            )
            ctr += 1

        return schedule

    @staticmethod
    def create_shift(schedule, supervisor, type, current_date, drivers):
        shift = Shift.objects.create(
            type=type,
            schedule=schedule,
            supervisor=supervisor,
            created=current_date,
            modified=current_date
        )

        shuttle_ids = [1,2,3,4,5,6,7]
        ctr = 0
        for driver in drivers:
            if (ctr == 1 or ctr == 2) and type == 'A':
                dep_type = "Early"
            elif (ctr == 1 or ctr == 2) and type == 'P':
                dep_type = "Late"
            else:
                dep_type = 'Regular'

            DriversAssigned.objects.create(
                driver_id=driver,
                deployment_type=dep_type,
                shift=shift,
                shuttle_id=shuttle_ids[ctr]
            )
            ctr += 1

    @staticmethod
    def start_shift_iteration(date, shift):
        return ShiftIteration.objects.create(
            date=date,
            shift=shift
        )

    @staticmethod
    def assign_tickets(driver, date, type):
        assigned_tickets = AssignedTicket.objects.filter(driver=driver, type=type)

        if not assigned_tickets:
            return PopulateRemittances.create_assigned_tickets(
                driver=driver,
                range_from=(driver.id * 1000),
                date=date,
                type=type
            )
        else:
            last_ticket = assigned_tickets.last()
            return PopulateRemittances.create_assigned_tickets(
                driver=driver,
                range_from=last_ticket.range_to + 1,
                date=date,
                type=type
            )

    @staticmethod
    def create_assigned_tickets(driver, range_from, type, date):
        ticket = AssignedTicket()
        ticket.driver = driver
        ticket.range_from = range_from
        ticket.type = type
        ticket.created = date
        ticket.compute_range_to(100)
        ticket.save()
        return ticket

    @staticmethod
    def get_last_consumed(assigned_ticket):
        return ConsumedTicket.objects.filter(
            assigned_ticket=assigned_ticket).last()

    @staticmethod
    def deploy_drivers(shift_iteration, date):
        hasAbsent = False
        for driver in DriversAssigned.objects.filter(shift=shift_iteration.shift):
            # driver can be absent sometimes
            num = randint(1, 15)
            if num <= 14 or hasAbsent == True:

                deployment_times = PopulateRemittances.get_deployment_times(date, shift_iteration.shift.type, driver.deployment_type)

                deployment = Deployment.objects.create(
                    driver=driver.driver,
                    shuttle=driver.shuttle,
                    route=driver.shuttle.route,
                    shift_iteration=shift_iteration,
                    created=date,
                    start_time=deployment_times["start_time"],
                    end_time=deployment_times["end_time"]
                )

                deployment.status = 'F'
                deployment.save()

                remittance = PopulateRemittances.submit_remittance(deployment, date)
                remittance.confirm_remittance()
            else:
                #deploy supervisor as sub
                hasAbsent = True
                supervisor = Driver.objects.get(id=driver.shift.supervisor_id)

                if driver.shuttle.route == 'Main Road':
                    route = 'M'
                elif driver.shuttle.route == 'Kaliwa':
                    route = 'L'
                else:
                    route = 'R'

                deployment = Deployment.objects.create(
                    driver=supervisor,
                    shuttle=driver.shuttle,
                    route=route,
                    shift_iteration=shift_iteration,
                    created=date
                )

                SubbedDeployments.objects.create(
                    deployment=deployment,
                    absent_driver=driver
                )

                deployment.status = 'F'
                deployment.save()

                remittance = PopulateRemittances.submit_remittance(deployment, date)
                remittance.confirm_remittance()

    @staticmethod
    def get_deployment_times(date, shift_type, deployment_type):
        temp_date = date
        if deployment_type == 'Early':
            start_time = temp_date.replace(hour=5)
            end_time = temp_date.replace(hour=12)
        elif deployment_type == 'Regular' and shift_type == 'A':
            start_time = temp_date.replace(hour=7)
            end_time = temp_date.replace(hour=14)
        elif deployment_type == 'Regular' and shift_type == 'P':
            start_time = temp_date.replace(hour=14)
            end_time = temp_date.replace(hour=21)
        else:
            start_time = temp_date.replace(hour=16)
            end_time = temp_date.replace(hour=23)
        
        return {'start_time': start_time, 'end_time': end_time}

    @staticmethod
    def is_tickets_enough(assigned_ticket, amount):
        last_consumed = PopulateRemittances.get_last_consumed(assigned_ticket)

        if last_consumed is None:
            return True

        if assigned_ticket.range_to - last_consumed.end_ticket < amount:
            return False
        else:
            return True

    @staticmethod
    def get_enough_amount(assigned_ticket):
        last_consumed = PopulateRemittances.get_last_consumed(assigned_ticket)

        return assigned_ticket.range_to - last_consumed.end_ticket

    @staticmethod
    def submit_remittance(deployment, date):
        pop = PopulateRemittances()

        #sometimes the shuttle needs fuel
        num = randint(1, 10)
        if num <= 7:
            fuel_cost = 0
            fuel_receipt = None
        else:
            fuel_cost = randint(50, 200)
            fuel_receipt = pop.generate_OR("OR", randint(33450, 35540))

        #sometimes the driver has other costs
        if num <= 9:
            other_cost = 0
        else:
            other_cost = randint(10, 50)

        remittance_form = RemittanceForm()
        remittance_form.deployment = deployment
        remittance_form.fuel_cost = fuel_cost
        remittance_form.other_cost = other_cost
        remittance_form.fuel_receipt = fuel_receipt
        remittance_form.km_from = deployment.shuttle.mileage
        remittance_form.km_to = pop.generate_new_mileage(deployment.shuttle)

        deployment.shuttle.mileage = remittance_form.km_to
        deployment.shuttle.save()
        remittance_form.save()

        # TODO generate consumed
        if pop.has_tickets(deployment.driver):
            print('I have tickets')
            if pop.is_main_road(deployment):
                ticket_a = pop.get_last_assigned(deployment.driver, 'A')
                ticket_b = pop.get_last_assigned(deployment.driver, 'B')
                ticket_c = pop.get_last_assigned(deployment.driver, 'C')
            else:
                ticket_a = pop.get_last_assigned(deployment.driver, 'A')
                ticket_b = pop.get_last_assigned(deployment.driver, 'B')
        else:
            print('I dont have tickets')
            if pop.is_main_road(deployment):
                ticket_a = pop.assign_tickets(deployment.driver, date, 'A')
                ticket_b = pop.assign_tickets(deployment.driver, date, 'B')
                ticket_c = pop.assign_tickets(deployment.driver, date, 'C')
            else:
                ticket_a = pop.assign_tickets(deployment.driver, date, 'A')
                ticket_b = pop.assign_tickets(deployment.driver, date, 'B')

        # compute totals
        if pop.is_main_road(deployment):
            print('I am main road')
            consumed_a = pop.generate_consumed(ticket_a, remittance_form, date)
            consumed_b = pop.generate_consumed(ticket_b, remittance_form, date)
            consumed_c = pop.generate_consumed(ticket_c, remittance_form, date)

            remittance_form.total = consumed_a.total + consumed_b.total + consumed_c.total
        else:
            print('I am ' + remittance_form.deployment.get_route_display())
            consumed_a = pop.generate_consumed(ticket_a, remittance_form, date)
            consumed_b = pop.generate_consumed(ticket_b, remittance_form, date)

            remittance_form.total = consumed_a.total + consumed_b.total

        total_costs = remittance_form.fuel_cost + remittance_form.other_cost
        remittance_form.total = remittance_form.total - total_costs
        remittance_form.save()

        return remittance_form

    @staticmethod
    def get_last_assigned(driver, type):
        return AssignedTicket.objects.filter(driver=driver, type=type).last()

    @staticmethod
    def generate_OR(string, num):
        return string + str(num)

    @staticmethod
    def generate_new_mileage(shuttle):
        return shuttle.mileage + randint(20, 40)

    @staticmethod
    def has_tickets(driver):
        tickets = AssignedTicket.objects.filter(driver=driver)
        if not tickets:
            return False
        return True

    @staticmethod
    def is_main_road(deployment):
        if deployment.route is 'Main Road':
            return True
        else:
            return False

    @staticmethod
    def generate_consumed(assigned_ticket, remittance_form, date):
        if PopulateRemittances.has_consumed(assigned_ticket):
            consumed = PopulateRemittances.get_last_consumed(assigned_ticket)
            start_ticket = consumed.end_ticket + 1
        else:
            start_ticket = assigned_ticket.range_from

        number_of_passengers = PopulateRemittances.get_number_of_passengers(
                assigned_ticket.type, 
                date,
                remittance_form.deployment.route)

        if PopulateRemittances.is_tickets_enough(assigned_ticket, number_of_passengers):
            end_ticket = start_ticket + number_of_passengers
        else:
            end_ticket = start_ticket + PopulateRemittances.get_enough_amount(assigned_ticket)
            assigned_ticket.is_consumed = True
            assigned_ticket.save()
            
            # if all tickets are consumed, assign new tickets for driver
            PopulateRemittances.assign_tickets(
                remittance_form.deployment.driver,
                remittance_form.deployment.shift_iteration.date,
                assigned_ticket.type
            )

        total = PopulateRemittances.compute_total(start_ticket, end_ticket, assigned_ticket.type)

        return ConsumedTicket.objects.create(
            remittance_form=remittance_form,
            assigned_ticket=assigned_ticket,
            start_ticket=start_ticket,
            end_ticket=end_ticket,
            total=total
        )

    @staticmethod
    def get_number_of_passengers(ticket_type, date, route_type):
        #If its a holiday
        pop = PopulateRemittances()
        if pop.is_summer_vacation(date):
            if pop.is_left_route(route_type):
                if ticket_type == 'A':
                    return randint(5, 8)
                else:
                    return randint(10, 15)
            elif pop.is_right_route(route_type):
                if ticket_type == 'A':
                    return randint(20, 25)
                else:
                    return randint(30, 35)
            else:
                if ticket_type == 'A':
                    return randint(25, 30)
                elif ticket_type == 'B':
                    return randint(50, 55)
                else:
                    return randint(18, 22)
        elif pop.is_holiday(date): 
            if ticket_type == 'A':
                return randint(10, 15)
            elif ticket_type == 'B':
                return randint(40, 45)
            else:
                return randint(15, 20)
        elif pop.is_weekend(date):
            if pop.is_left_route(route_type):
                if ticket_type == 'A':
                    return randint(25, 30)
                else:
                    return randint(48, 53)
            elif pop.is_right_route(route_type):
                if ticket_type == 'A':
                    return randint(25, 30)
                else:
                    return randint(45, 50)
            else:
                if ticket_type == 'A':
                    return randint(25, 30)
                elif ticket_type == 'B':
                    return randint(50, 55)
                else:
                    return randint(20, 25)
        else:
            if ticket_type == 'A':
                return randint(30, 35)
            elif ticket_type == 'B':
                return randint(60, 65)
            else:
                return randint(25, 30)
    
    @staticmethod
    def is_weekend(date):
        day = date.weekday()

        if day == 0 or day == 6:
            return True
        return False

    @staticmethod
    def is_holiday(date):
        holidays = [
            datetime(2017, 1, 1),
            datetime(2017, 1, 2),
            datetime(2017, 4, 9),
            datetime(2017, 4, 13),
            datetime(2017, 4, 14),
            datetime(2017, 5, 1),
            datetime(2017, 6, 12),
            datetime(2017, 8, 28),
            datetime(2017, 11, 30),
            datetime(2017, 12, 25),
            datetime(2017, 12, 30),
            datetime(2017, 1, 28),
            datetime(2017, 2, 25),
            datetime(2017, 4, 15),
            datetime(2017, 8, 21),
            datetime(2017, 11, 1),
            datetime(2017, 12, 31),
            datetime(2017, 10, 31),
            datetime(2018, 1, 1),
            datetime(2018, 3, 29),
            datetime(2018, 3, 30),
            datetime(2018, 4, 9),
            datetime(2018, 5, 1),
            datetime(2018, 6, 12),
            datetime(2018, 6, 15),
            datetime(2018, 8, 27),
            datetime(2018, 11, 30),
            datetime(2018, 12, 25),
            datetime(2018, 12, 30),
            datetime(2018, 2, 16),
            datetime(2018, 2, 25),
            datetime(2018, 3, 31),
            datetime(2018, 8, 21),
            datetime(2018, 11, 1),
            datetime(2018, 12, 31),
            datetime(2018, 5, 14),
            datetime(2018, 11, 2),
            datetime(2018, 12, 24),
            datetime(2019, 1, 1),
            datetime(2019, 2, 5),
            datetime(2019, 2, 25)
        ]

        for holiday in holidays:
            if date == holiday:
                return True
        return False

    @staticmethod
    def is_route_main_road(route):
        if route == 'M' or route == 'Main Road':
            return True
        return False
    
    @staticmethod
    def is_right_route(route):
        if route == "R" or route == 'Kanan' or route == 'Right Route' or route == 'Right':
            return True
        return False
    
    @staticmethod
    def is_left_route(route):
        if route == 'L' or route == 'Kaliwa' or route == 'Left Route' or route == 'Left':
            return True
        return False

    @staticmethod
    def is_summer_vacation(date):
        if date > datetime(date.year, 3, 20) and date < datetime(date.year, 6, 5):
            return True
        return False

    @staticmethod
    def has_consumed(assigned_ticket):
        tickets = ConsumedTicket.objects.filter(assigned_ticket=assigned_ticket)
        if not tickets:
            return False
        else:
            return True


    @staticmethod
    def compute_total(start_ticket, end_ticket, type):
        if type is 'A':
            return (end_ticket - start_ticket) * 10
        elif type is 'B':
            return (end_ticket - start_ticket) * 12
        else:
            return (end_ticket - start_ticket) * 15