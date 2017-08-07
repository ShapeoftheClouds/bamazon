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
// The start function. Calls the table and user input functions.
function start() {
	console.log("Below is a list of our inventory.")
	table();
	// userInput();
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
			var chosenItem;
			for (var jindex = 0; jindex < results.length; jindex++) {
				if (answer.itemnumber == results[jindex].item_id) {
					chosenItem = results[jindex].product_name;
					chosenItemAmount = answer.amount;
					stockQuantity = results[jindex].stock_quantity;
					console.log("You've decided to purchase a " + chosenItem + " in the amount of " + chosenItemAmount);
					var currentStock = stockQuantity - answer.amount;

					connection.query("UPDATE products SET stock_quantity WHERE item_id = answer.itemnumber")

				} else if (answer.itemnumber >= 11) {
					console.log("You've selected an item that does not exist in our database.");
				}
			};
		});
	});
};
