// Require in modules
const inquirer = require("inquirer");
const mysql = require("mysql2");
require('dotenv').config()

// We connect to the database and use dotenv to hide the connect data
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log("Connected to the company_db database....")
);
// Throw error
db.connect((err) => {
    if (err) {
        throw err;
    }
});

//inqurirer
promptUser()
// We create a inquier prompt to display the choices in the terminal to the user
function promptUser() {
    return inquirer.prompt([
        {
            type: "list",
            name: "displayChoices",
            message: "Please choose an option",
            choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "delete an employee", "delete a department", "delete a role", "view a deparment budget"]


        }
    ]).then((selectedOption) => {
        // We grab the take the selected choice and exexute a switch case statement to pass it to the correct function
        switch (selectedOption.displayChoices) {
            case "view all departments":
                viewDepartments()
                break;
            case "view all roles":
                viewRoles()
                break;
            case "view all employees":
                viewEmployees()
                break;
            case "add a department":
                addDepartment()
                break;
            case "add a role":
                addRole()
                break;
            case "add an employee":
                addEmployee()
                break;
            case "update an employee role":
                updateEmployeeRole()
                break;
            case "delete an employee":
                deleteEmployee()
                break;
            case "delete a department":
                deleteDepartment()
                break;
            case "delete a role":
                deleteRole()
                break;
            case "view a deparment budget":
                viewBudget()
            default:
                console.log("you are exiting");
                break;
        }
    })

}



// VIEW Departments
function viewDepartments() {
    db.query('SELECT * FROM company_db.department;', (err, results) => {
        if (err) {
            console.log(err)
        } else {
            console.table(results)
            promptUser()
        }
    })

}
// VIEW Roles
function viewRoles() {
    db.query('SELECT role.id, role.title, role.salary, role.department_id, department.name FROM department RIGHT JOIN role on department.id = role.department_id;', (err, results) => {
        if (err) {
            console.log(err)
        } else {
            console.table(results)
            promptUser()
        }
    })
}
// VIEW Employees
function viewEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, role.title, department.name, concat(manager.first_name, " ", manager.last_name) AS manager FROM role JOIN employee on role.id = employee.role_id LEFT JOIN employee manager on employee.manager_id = manager.id JOIN department on department.id = role.department_id;', (err, results) => {
        if (err) {
            console.log(err)
        } else {
            console.table(results)
            promptUser()
        }
    })
}
// VIEW Budget by department
function viewBudget() {
    db.query('SELECT * FROM department', (err, results) => {
        let deparmentArray = []
        results.forEach((result) => deparmentArray.push({ name: result.name, value: result.id }))
        return inquirer.prompt([
            {
                type: "list",
                name: "deparmentBudget",
                message: "Which department would you like to view the total budget for?",
                choices: deparmentArray
            }
        ]).then((data) => {
            db.query(`SELECT SUM(role.salary) AS department_budget, department.name from employee JOIN role JOIN department on department.id = role.department_id ON employee.role_id = role.id WHERE role.department_id=${data.deparmentBudget}`, (err, results) => {

                if (err) {
                    console.log(err)
                } else {
                    console.table(results)
                    promptUser()
                }
            })
        })
    })
}

// ADD Department
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "department_name",
            message: "Please enter a department name",

        }
    ]).then((results) => {

        db.query(`INSERT INTO department(name) VALUES ('${results.department_name}')`, (err, results) => {
            if (err) throw new Error("query failure : ", err)
            viewDepartments()
        })
    })


}

// ADD Role
function addRole() {

    db.query('SELECT * FROM department', (err, results) => {
        var departmentArray = []
        results.forEach((result) => departmentArray.push({ name: result.name, value: result.id }))
        return inquirer.prompt([
            {
                type: "list",
                name: "displayDepartment",
                choices: departmentArray,
                message: "Please choose a department",
            },
            {
                type: "input",
                name: "roleTitle",
                message: "please input a name for this role",

            },
            {
                type: "input",
                name: "roleSalary",
                message: "please input a salary for this role",

            }
        ]).then((results) => {
            db.query(`INSERT INTO role(title, salary, department_id ) VALUES ('${results.roleTitle}', '${results.roleSalary}', '${results.displayDepartment}')`, (err, results) => {
                if (err) throw new Error("query failure : ", err);
                viewRoles()

            })
        })
    })


}

// ADD Employee

function addEmployee() {
    return inquirer.prompt([
        {
            type: "input",
            name: "employeeFirstName",
            message: "Please enter the employees first name"
        },
        {
            type: "input",
            name: "employeeLastName",
            message: "Please enter the employees last name"
        },
        {
            type: "input",
            name: "roleId",
            message: "Please enter a role id for the employee"
        }
    ]).then((data) => {

        db.query("SELECT * from employee WHERE manager_id is null", function (err, results) {
            var managerArray = []
            results.forEach((result) => managerArray.push({ name: result.first_name + " " + result.last_name, value: result.id }))
            return inquirer.prompt([
                {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managerArray
                },
            ]).then((selectedManager) => {
                db.query(`INSERT  INTO company_db.employee (company_db.employee.first_name, company_db.employee.last_name, company_db.employee.role_id, company_db.employee.manager_id) Values("${data.employeeFirstName}", "${data.employeeLastName}", ${data.roleId}, ${selectedManager.manager})`, function (err, results) { // working, the placeholder needed to be in ()
                    if (err) throw new Error("query failure : ", err);
                    viewEmployees();
                })

            })

        })
    })
}



//Update Employee
function updateEmployeeRole() {
    db.query("SELECT * from employee", function (err, results) {
        var employeeArray = [];
        results.forEach((result) => employeeArray.push({ name: result.first_name + " " + result.last_name, value: result.id }))
        return inquirer.prompt([
            {
                type: "list",
                name: "employeeToBeUpdated",
                message: "Which employee would you like to update?",
                choices: employeeArray
            },
            {
                type: "input",
                name: "role_id",
                message: "Please enter a role number",

            }
        ]).then((data) => {
            const { employeeToBeUpdated, role_id } = data
            db.query(`UPDATE employee SET role_id=${role_id} WHERE id=${employeeToBeUpdated}`, (err, results) => {
                if (err) throw new Error("query failure : ", err);
                viewEmployees()
            })

        })

    })

}


//Delete Department
function deleteDepartment() {
    db.query('SELECT * FROM department;', (err, results) => {
        var deparmentArray = []
        results.forEach((result) => deparmentArray.push({ name: result.name, value: result.id }))
        return inquirer.prompt([
            {
                type: "list",
                name: "deparmentToBeDeleted",
                message: "Which department would you like to delete?",
                choices: deparmentArray
            }
        ]).then((data) => {
            db.query(`DELETE FROM department WHERE id=${data.deparmentToBeDeleted}`, (err, results) => {
                if (err) throw new Error("query failure : ", err);
                viewDepartments()
            })

        })

    })
}
//Delete Role
function deleteRole() {
    db.query('SELECT * FROM role', (err, results) => {
        var roleArray = []
        results.forEach((result) => roleArray.push({ name: result.title, value: result.id }))
        return inquirer.prompt([
            {
                type: "list",
                name: "roleToBeDeleted",
                message: "Which role would you like to delete?",
                choices: roleArray
            }
        ]).then((data) => {
            db.query(`DELETE FROM role WHERE id=${data.roleToBeDeleted}`, (err, results) => {
                if (err) throw new Error("query failure : ", err);
                viewRoles()
            })

        })

    })
}
//Delete Employee
function deleteEmployee() {
    db.query('SELECT * FROM employee', (err, results) => {
        var employeeArray = []
        results.forEach((result) => employeeArray.push({ name: result.first_name + " " + result.last_name, value: result.id }))
        return inquirer.prompt([
            {
                type: "list",
                name: "employeeToBeDeleted",
                message: "Which employee would you like to delete?",
                choices: employeeArray
            }
        ]).then((data) => {
            db.query(`DELETE FROM employee WHERE id=${data.employeeToBeDeleted}`, (err, results) => {
                if (err) throw new Error("query failure : ", err);
                viewEmployees()
            })


        })

    })
}