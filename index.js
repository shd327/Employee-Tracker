
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
db.connect((err) => {
    if (err) {
        throw error;
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



// VIEW
function viewDepartments() {
    db.query('SELECT * FROM company_db.department;', (err, results) => {
        if (err) {
            console.log(err)
        } else {
            console.table(results)
        }
    })
}
function viewRoles() {
    db.query('SELECT role.id, role.title, role.salary, role.department_id, department.name FROM department RIGHT JOIN role on department.id = role.department_id;', (err, results) => {
        if (err) {
            console.log(err)
        } else {
            console.table(results)
        }
    })
}
function viewEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, role.title, department.name, concat(manager.first_name, " ", manager.last_name) AS manager FROM role JOIN employee on role.id = employee.role_id LEFT JOIN employee manager on employee.manager_id = manager.id JOIN department on department.id = role.department_id;', (err, results) => {
        if (err) {
            console.log(err)
        } else {
            console.table(results)
        }
    })
}
function viewBudget() {
}



// ADD
function addDepartment() {
    return inquirer.prompt([
        {
            type: "input",
            name: "department_name",
            message: "Please enter a department name",

        }
    ]).then((results) => {
        db.query(`INSERT INTO department(name) VALUES ('${results.department_name}')`, (err, results) => {
            if (err) {
                console.log(err)
            } else {
                viewDepartments()
            }
        })
    })

    // inqurier
}
function addRole() {

    db.query('SELECT * FROM department', (err, results) => {
        var departmentArray = []
        results.forEach((result) => departmentArray.push({ name: result.name, value: result.id }))
        // console.log(results)
        // console.log(departmentArray)
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
                if (err) {
                    console.log(err)
                } else {
                    viewRoles()
                }
            })
        })
    })




}
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
            console.log(results)
            results.forEach((result) => managerArray.push({ name: result.first_name + " " + result.last_name, value: result.id }))
            console.log(managerArray)
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
                })
                viewEmployees();
            })

        })
    })
}



//Update
function updateEmployeeRole() {
}


//Delete
function deleteDepartment() {
}
function deleteRole() {
}
function deleteEmployee() {
}