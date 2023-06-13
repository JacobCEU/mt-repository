const database = require('../models/connection_db')
const storeModel = require('../models/store.model')

 //add
const addStore = (req,res,next)=>{
    let storeId = req.body.id;
    let storeManager = req.body.manager;
    let storeAddress = req.body.address;
    let storeContactNo = req.body.contactNo;
    let storeEmail = req.body.email;

    if (storeManager == "" || storeManager == null || storeAddress == "" || storeAddress == null || storeContactNo =="" || storeContactNo == null || storeEmail =="" || storeEmail == null) {
        res.status(404).json({
            successful: false,
            message: "Invalid/Incomplete store credentials. "
        })
    
    } else {
        let query = `SELECT store_contactNo FROM store_tbl WHERE store_contactNo = '${storeContactNo}'`

        database.db.query(query,(err, rows,result)=>{
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
                        message: "There is already an existing store branch registered to this contact number."
                    })
                }
                else{
                    let insertQuery = `INSERT INTO store_tbl SET ?`
                    let storeObj = storeModel.store_model(storeId, storeManager, storeAddress, storeContactNo, storeEmail)

                    database.db.query(insertQuery, storeObj, (err,rows,result)=>{
                        if (err){
                            res.status(500).json({
                                successful: false,
                                message: err
                            })
                        }
                        else{
                            res.status(200).json({
                                successful: true,
                                message: "Successfully added new store branch to database!"
                            })
                        }
                    })
                }
            }
        })
    }
}

 //view all store
const viewAllStores = (req,res,next)=>{
    let query = `SELECT store_id, store_manager FROM store_tbl;`
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
                    message: "Displaying all store branches",
                    count: rows.length,
                    data: rows
                })
            } else {
                res.status(200).json({
                    successful: true,
                    message: "No stores are established",
                })
            }
        }
    })
}

 //view store details
 const viewStoreDetails = (req,res,next)=>{

  const storeId = req.params.id;

    let query = `SELECT store_manager, store_address, store_contactNo, store_email FROM store_tbl WHERE store_id = ${storeId}`;
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
                    message: "Displaying store branch details",
                    count: rows.length,
                    data: rows
                })
            } else {
                res.status(200).json({
                    successful: true,
                    message: "No known store branches registered in the database",
                })
            }
        }
    })
}

  //update
const updateStore = (req, res, next) => {
    const storeId = req.params.id;

    const storeManager = req.body.manager;
    const storeContactNo = req.body.contactNo;
    const storeEmail = req.body.email;
  
    if (storeEmail == "" || storeEmail == null || storeManager == "" || storeManager == null || storeContactNo == "" || storeContactNo == null) {
      return res.status(400).json({
        successful: false,
        message: "Some info is missing.",
      });
    }
  
    const selectQuery = `SELECT store_id FROM store_tbl WHERE store_id = ${storeId}`;
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
          message: "Store does not exist.",
        });
      }
      
      const updateQuery = `UPDATE store_tbl SET store_manager = '${storeManager}', store_contactNo = '${storeContactNo}', store_email = '${storeEmail}'`;
      database.db.query(updateQuery, (err, updatedRows) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }
  
        res.status(200).json({
          successful: true,
          message: "Store successfully updated.",
        });
      });
    });
  };
  
//delete
const deleteStore = (req, res, next) => {
  let storeId = req.params.id;
  if (storeId == "" || storeId == null) {
    
    res.status(404).json({
      successful: false,
      message: "Store does not exist in database",
    });
  } else {
    let query = `SELECT store_id FROM store_tbl WHERE store_id = ${storeId}`;
    
    
    database.db.query(query, (err, rows, result) => {
      if (err) {
        
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (rows.length > 0) {
          
          let deleteQuery = `DELETE FROM store_tbl WHERE store_id = ${storeId}`;
          
          database.db.query(deleteQuery, (err, rows, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              res.status(200).json({
                successful: true,
                message: "Store is successfully deleted!",
              });
            }
          });
        } else {
          res.status(400).json({
            successful: false,
            message: "Store id does not exist.",
          });
        }
      }
    });
  }
};


module.exports = {
    addStore,
    viewAllStores,
    viewStoreDetails,
    updateStore,
    deleteStore
}