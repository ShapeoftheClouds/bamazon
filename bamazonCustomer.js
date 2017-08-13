var mysql = require("mysql");
var inquirer = require("inquirer");
var fs = require("fs");
var Table = require('cli-table');
var shoppingArray = [];
// Connects to mysql
var connection = mysql.createConnection(
	{
		host: "localhost",
		user: "root",
		password: "root",
		database: "bamazon_db"
	}
);

// The start function. Calls the table and user input functions.
function start() {
	console.log("Below is a list of our inventory.")
	table();
};

// Starts the user prompt.
start();

// The table function. Creates a table with mysql data with products for the user to buy from.
function table() {
	connection.query('SELECT * FROM products', (err, rows) => {
		if (err) throw err;
		// Creating the table
		var table = new Table({
			head: ["Item ID", "Product Name", "Department", "Price", "Stock Quantity"]
			, colWidths: [25, 25, 25, 25, 25]
		});

		// Use a for loop to grab the mysql data.
		for (var index = 0; index < rows.length; index++) {
			table.push(
				[rows[index].item_id, rows[index].product_name, rows[index].department_name,
				rows[index].price, rows[index].stock_quantity]
				);
		};

		console.log(table.toString());
		userInput();
	});
};

function userInput() {
	connection.query("SELECT * FROM products", function(err, results) {
		if (err) throw err;

		inquirer
		.prompt([
		{
			name: "itemnumber",
			type: "input",
			message: "Which item would you like to purchase? Please input item ID",
		},
		{
			name: "amount",
			type: "input",
			message: "Select the amount you would like to purchase."
		}
		]).then(function(answer){
			// Var for item name, number, amount, quantity, and cost of items purchased.
			var chosenItemName;
			var chosenItemNumber;
			var chosenItemAmount;
			var stockQuantity;
			var cost;
			for (var jindex = 0; jindex < results.length; jindex++) {

				if (answer.amount > results[jindex].stock_quantity) {
					console.log("Sorry we're either out of stock or do not carry the amount you've entered.");
				}

				else if (answer.itemnumber == results[jindex].item_id) {
					// Var for item name, number, amount, quantity, and cost of items purchased.
					chosenItemName = results[jindex].product_name;
					chosenItemNumber = results[jindex].item_id;
					chosenItemAmount = answer.amount;
					stockQuantity = results[jindex].stock_quantity;
					cost = results[jindex].price;

					// The current item stock.
					var currentStock = stockQuantity - answer.amount;
					// The amount charged to user.
					var amountOwed = cost * chosenItemAmount;
					// Letting the user know what items they've selected, and the amount.
					console.log("You've decided to purchase a " + chosenItemName + " in the amount of " + chosenItemAmount);
					// Updating the mysql database.
					connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [currentStock, chosenItemNumber], function (error, results, fields) {
						if (error) throw error;
 						 // console.log(results);
						});
					// Letting the user know how much the've been charged for the items purchased.
					console.log("You've been charged the amount of $" + amountOwed);
					// If a number is selected that is more than 10, let the user know no such item exists.
				}

				else if (answer.itemnumber >= 11) {
					console.log("You've selected an item that does not exist in our database.");
				}
			};
			setTimeout(function() { start(); }, 5000);
		});
	});
};
