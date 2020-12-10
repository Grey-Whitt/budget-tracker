// this variable will hold the connection
let db;
// establish a connection to the database, set it to version 1
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    //save reference to the db
    const db = event.target.result

    //create an object store/table 
    db.createObjectStore('new_transaction', { autoIncrement: true })
}


request.onsuccess = function (event) {
    // when db is created save reference to db in global variable
    db = event.target.result;

    // if the app is online send all local db data to api
    if (navigator.onLine) {
        // we haven't created this yet

    }
};

//this works as a catch for errors 
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

// this will run if a new transaction is created with no internet access
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // add record to the store using .add()
    budgetObjectStore.add(record);
}

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access your object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    // access the new_transaction object store
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clear all items in your store
                    transactionObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

window.addEventListener('online', uploadTransaction);