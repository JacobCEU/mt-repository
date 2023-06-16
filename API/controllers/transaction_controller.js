const database = require('../models/connection_db')
const transactionModel = require('../models/transaction.model')

 //add transaction
 const addTransaction = (req, res, next) => {
  let transId = req.body.id;
  const userId = req.params.id;

  let storeId = req.body.store;
  let recipientName = req.body.rName;
  let recipientCN = req.body.rContact;
  let transAmt = req.body.amount;
  let receiveDate = req.body.rDate;

  if (
    storeId == "" ||
    storeId == null ||
    recipientName == "" ||
    recipientName == null ||
    recipientCN == "" ||
    recipientCN == null ||
    transAmt == "" ||
    transAmt == null ||
    receiveDate == "" ||
    receiveDate == null
  ) {
    res.status(404).json({
      successful: false,
      message: "Invalid transaction input./Missing transaction info.",
    });
  } else {
    let storeQuery = `SELECT store_id, store_status FROM store_tbl WHERE store_id = '${storeId}'`;
    let userQuery = `SELECT user_id, user_status FROM user_tbl WHERE user_id = '${userId}'`;
    database.db.query(storeQuery, (err, storeRows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (storeRows.length === 0) {
          res.status(400).json({
            successful: false,
            message: "There is no existing store with that ID.",
          });
        } else {
          const storeStatus = storeRows[0].store_status;
          if (storeStatus === "Out of service") {
            return res.status(400).json({
              successful: false,
              message: "This store is currently out of service.",
            });
          }

          database.db.query(userQuery, (err, userRows) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              if (userRows.length === 0) {
                res.status(400).json({
                  successful: false,
                  message: "There is no existing user with that ID.",
                });
              } else {
                const userStatus = userRows[0].user_status;
                if (userStatus === "Inactive") {
                  return res.status(400).json({
                    successful: false,
                    message: "This user is currently inactive.",
                  });
                }

                if (!recipientCN.startsWith("+63")) {
                  return res.status(400).json({
                    successful: false,
                    message: "A Philippine contact number is required starting with '+63'.",
                  });
                } else if (recipientCN.length !== 13) {
                  return res.status(400).json({
                    successful: false,
                    message: "That is not a valid contact number length.",
                  });
                } else if (!/^\+?[0-9]+$/.test(recipientCN)) {
                  return res.status(400).json({
                    successful: false,
                    message: "That is not a valid contact number.",
                  });
                } else if (transAmt < 500) {
                  return res.status(400).json({
                    successful: false,
                    message: "Sorry, the minimum transaction of 500.00 is required.",
                  });
                } else if (transAmt > 250000) {
                  return res.status(400).json({
                    successful: false,
                    message: "Sorry, the maximum limit of the transaction is 250,000.00.",
                  });
                }

                // Get the current system datetime
                const currentDatetime = new Date().toISOString().slice(0, 19).replace("T", " ");
                const today = new Date().toISOString().slice(0, 10); // Today's date

                if (receiveDate < today) {
                  return res.status(400).json({
                    successful: false,
                    message: "A transaction cannot be received in the past.",
                  });
                }

                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() + 30); // Adding 30 days to the current date

                if (new Date(receiveDate) > maxDate) {
                  return res.status(400).json({
                    successful: false,
                    message: "The receive date cannot be more than 30 days.",
                  });
                }

                let insertQuery = `INSERT INTO transaction_tbl SET ?`;
                let transactionObj = transactionModel.transaction_model(
                  transId,
                  userId,
                  storeId,
                  recipientName,
                  recipientCN,
                  transAmt,
                  receiveDate,
                  currentDatetime,
                  "Ongoing" // Add transaction_status with initial value "Ongoing"
                );

                database.db.query(insertQuery, transactionObj, (err, rows, result) => {
                  if (err) {
                    res.status(500).json({
                      successful: false,
                      message: err,
                    });
                  } else {
                    res.status(200).json({
                      successful: true,
                      message: "Successfully made a new transaction!",
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
  }
};



 //view all transaction
const viewAllTransaction = (req,res,next)=>{

    let userId = req.params.id;

    if (isNaN(userId)) {
      res.status(500).json({
          successful: false,
          message: "Invalid user ID"
      });
    return;
  }

    let query = `SELECT transaction_id, recipient_name, recipient_contactNo, transaction_amt, transaction_date, receive_date FROM transaction_tbl WHERE user_id = '${userId}'`
    database.db.query(query, (err, rows, result)=>{
        if (err){
            res.status(500).json({
                successful: false,
                message: err
            })
        } else {
            if (rows.length > 0) {
                res.status(200).json({
                    successful: true,
                    message: "Succesfully got all transactions of user: " + userId,
                    count: rows.length,
                    data: rows
                })
            } else {
                res.status(200).json({
                    successful: true,
                    message: "No User available in the database/The user has no transactions",
                })
            }
        }
    })
}

//delete
const cancelTransaction = (req, res, next) => {
  let transId = req.params.id;
  if (transId == "" || transId == null) {
    res.status(404).json({
      successful: false,
      message: "Transaction ID is not found",
    });
  } else {
    let query = `SELECT transaction_id FROM transaction_tbl WHERE transaction_id = ${transId}`;
    
    database.db.query(query, (err, rows, result) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (rows.length > 0) {
          let updateQuery = `UPDATE transaction_tbl SET transaction_status = 'Canceled' WHERE transaction_id = ${transId}`;

          database.db.query(updateQuery, (err, rows, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              res.status(200).json({
                successful: true,
                message: "Transaction status is now canceled!",
              });
            }
          });
        } else {
          res.status(400).json({
            successful: false,
            message: "Transaction does not exist.",
          });
        }
      }
    });
  }
};




module.exports = {
    addTransaction,
    viewAllTransaction,
    cancelTransaction
}