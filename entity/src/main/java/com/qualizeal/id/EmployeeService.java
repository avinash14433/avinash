package com.qualizeal.id;
import  java.util.ArrayList;


public class EmployeeService {
			public ArrayList employeelist = new ArrayList();
			
			public void viewAllEmployees()
			
			{
				if (employeeList.size() == 0) {
					System.out.println("no employess found");
					return ;
				}
				for (Object obj : employeeList) {
					Employee employee = (Employee) obj;
					System.out.println(" employess ");
				}

					
				}
			public boolean addEmploye(Employee employee) {
				boolean status = false;
				
				if (employee != null) {
					if(employeeList.add(employee)) {
						status = true;
					}
				}
					return status;
			}
		
			
        