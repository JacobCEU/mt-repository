const database = require('../models/connection_db')
const transactionModel = require('../models/transaction.model')

 //add transaction
const addTransaction = (req,res,next)=>{
    let transId =  req.body.id;

    const userId = req.params.id;

    let storeId = req.body.store;
    let transRec = req.body.rec;
    let transAmt = req.body.amt;
    let transDate = req.body.date;

    if (storeId == "" || storeId == null || transAmt == "" || transAmt == null || transDate == "" || transDate == null || transRec == "" || transRec == null) {
        res.status(404).json({
            successful: false,
            message: "Invalid transaction input./Missing transaction info."
        })
    
    } else {
        let query = `SELECT user_id FROM transaction_tbl WHERE user_id = '${userId}'`

        database.db.query(query,(err, rows, result)=>{
            if(err){
                res.status(500).json({
                    successful: false,
                    message: err
                })
            }
            else{
                if(rows.length > 0){
                    res.status(400).json({
                        successful: false,
                        message: "This Transaction already exists."
                    })
                }
                else{
                    let insertQuery = `INSERT INTO transaction_tbl SET ?`
                    let transactionObj = transactionModel.transaction_model(transId, userId, storeId, transRec, transAmt, transDate)

                    database.db.query(insertQuery, transactionObj, (err,rows,result)=>{
                        if (err){
                            res.status(500).json({
                                successful: false,
                                message: err
                            })
                        }
                        else{
                            res.status(200).json({
                                successful: true,
                                message: "Successfully made a new transaction!"
                            })
                        }
                    })
                }
            }
        })
    }
}

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

    let query = `SELECT transaction_id, recipient, transaction_amt, transaction_date FROM transaction_tbl WHERE user_id = '${userId}'`
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

  //update
const updateTransaction = (req, res, next) => {
    const transId = req.params.id;
 
    let transRec = req.body.rec;
    let transAmt = req.body.amt;
    let transDate = req.body.date;
  
    if (transAmt == "" || transAmt == null || transDate == "" || transDate == null || transRec == "" || transRec == null) {
      return res.status(400).json({
        successful: false,
        message: "Unable to update, missing information",
      });
    }
  
    const selectQuery = `SELECT transaction_id FROM transaction_tbl WHERE transaction_id = ${transId}`;
    database.db.query(selectQuery, (err, rows) => {
      if (err) {
        return res.status(500).json({
          successful: false,
          message: err,
        });
      }
  
      if (rows.length === 0) {
        return res.status(404).json({  
          successful: false,
          message: "Transaction does not exist.",
        });
      }
      
      const updateQuery = `UPDATE transaction_tbl SET recipient = '${transRec}', transaction_amt = ${transAmt}, transaction_date = '${transDate}' WHERE transaction_id = ${transId}`;
      database.db.query(updateQuery, (err, updatedRows) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }

        res.status(200).json({
          successful: true,
          message: "User successfully updated.",
        });
      });
    });
};

//delete
const deleteTransaction = (req, res, next) => {
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
          let deleteQuery = `DELETE FROM transaction_tbl WHERE transaction_id = ${transId}`;     

          database.db.query(deleteQuery, (err, rows, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              res.status(200).json({
                successful: true,
                message: "Transaction is successfully deleted!",
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
    updateTransaction,
    deleteTransaction
}