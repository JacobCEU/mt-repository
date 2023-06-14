const database = require('../models/connection_db')
const storeModel = require('../models/store.model')

 //establish a new store
const addStore = (req, res, next) => {
  let storeId = req.body.id;
  let storeName = req.body.name;
  let storeManager = req.body.manager;
  let storeAddress = req.body.address;
  let storeContactNo = req.body.contactNo;
  let storeEmail = req.body.email;

  if (storeName === '' || storeName === null || storeManager === '' || storeManager === null || storeAddress === '' || storeAddress === null || storeContactNo === '' || storeContactNo === null || storeEmail === '' || storeEmail === null) {
    res.status(404).json({
      successful: false,
      message: 'Invalid/Incomplete store credentials.',
    });
  } else {
    if (!storeContactNo.startsWith('+63')) {
      res.status(400).json({
        successful: false,
        message: "A Philippine contact number is required starting with '+63'.",
      });
    } else if (storeContactNo.length !== 13) {
      res.status(400).json({
        successful: false,
        message: 'That is not a valid contact number length.',
      });
    } else if (!/^\+?[0-9]+$/.test(storeContactNo)) {
      res.status(400).json({
        successful: false,
        message: 'That is not a valid contact number.',
      });
    } else if (!storeEmail.includes('@')) {
      res.status(400).json({
        successful: false,
        message: 'Not a valid email address.',
      });
    } else {
      let query = `SELECT store_contactNo FROM store_tbl WHERE store_contactNo = '${storeContactNo}' OR store_email = '${storeEmail}'`;

      database.db.query(query, (err, rows, result) => {
        if (err) {
          res.status(500).json({
            successful: false,
            message: err,
          });
        } else {
          if (rows.length > 0) {
            const existingStore = rows.find((row) => row.store_contactNo === storeContactNo);
            if (existingStore) {
              res.status(400).json({
                successful: false,
                message: 'There is already an existing store branch registered to this contact number.',
              });
            } else {
              res.status(400).json({
                successful: false,
                message: 'Email is already registered on another store branch.',
              });
            }
          } else {
            let insertQuery = `INSERT INTO store_tbl SET ?`;
            let storeObj = storeModel.store_model(storeId, storeName, storeManager, storeAddress, storeContactNo, storeEmail);
            storeObj.store_status = 'In service'; 

            database.db.query(insertQuery, storeObj, (err, rows, result) => {
              if (err) {
                res.status(500).json({
                  successful: false,
                  message: err,
                });
              } else {
                res.status(200).json({
                  successful: true,
                  message: 'Successfully established a new store branch!',
                });
              }
            });
          }
        }
      });
    }
  }
};

 //view all store (IN DATABASE)
const viewAllStores = (req,res,next)=>{
    let query = `SELECT store_id, store_name, store_manager, store_status FROM store_tbl;`
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

    let query = `SELECT store_name, store_manager, store_address, store_contactNo, store_email, store_status FROM store_tbl WHERE store_id = ${storeId}`;
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

//update store details
const updateStore = (req, res, next) => {
  const storeId = req.params.id;

  const storeName = req.body.name;
  const storeManager = req.body.manager;
  const storeContactNo = req.body.contactNo;
  const storeEmail = req.body.email;

  if (storeName === '' || storeName === null || storeEmail === '' || storeEmail === null || storeManager === '' || storeManager === null || storeContactNo === '' || storeContactNo === null) {
    return res.status(400).json({
      successful: false,
      message: 'Some info is missing.',
    });
  }

  if (!storeContactNo.startsWith('+63')) {
    return res.status(400).json({
      successful: false,
      message: "A Philippine contact number is required starting with '+63'.",
    });
  } else if (storeContactNo.length !== 13) {
    return res.status(400).json({
      successful: false,
      message: 'That is not a valid contact number length.',
    });
  } else if (!/^\+?[0-9]+$/.test(storeContactNo)) {
    return res.status(400).json({
      successful: false,
      message: 'That is not a valid contact number.',
    });
  }

  if (!storeEmail.includes('@')) {
    return res.status(400).json({
      successful: false,
      message: 'Not a valid email address.',
    });
  }

  const selectQuery = `SELECT store_id, store_contactNo, store_email FROM store_tbl WHERE store_id = ${storeId}`;
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
        message: 'Store does not exist.',
      });
    }

    const existingStore = rows[0];
    const existingContactNo = existingStore.store_contactNo;
    const existingEmail = existingStore.store_email;

    if (existingContactNo !== storeContactNo) {
      const contactNoCheckQuery = `SELECT store_id FROM store_tbl WHERE store_contactNo = '${storeContactNo}'`;
      database.db.query(contactNoCheckQuery, (err, contactNoRows) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }

        if (contactNoRows.length > 0) {
          return res.status(400).json({
            successful: false,
            message: 'Contact number is already registered on another store branch.',
          });
        }

        updateStoreData();
      });
    } else if (existingEmail !== storeEmail) {
      const emailCheckQuery = `SELECT store_id FROM store_tbl WHERE store_email = '${storeEmail}'`;
      database.db.query(emailCheckQuery, (err, emailRows) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }

        if (emailRows.length > 0) {
          return res.status(400).json({
            successful: false,
            message: 'Email is already registered on another store branch.',
          });
        }

        updateStoreData();
      });
    } else {
      updateStoreData();
    }

    function updateStoreData() {
      const updateQuery = `UPDATE store_tbl SET store_name = '${storeName}', store_manager = '${storeManager}', store_contactNo = '${storeContactNo}', store_email = '${storeEmail}' WHERE store_id = ${storeId}`;
      database.db.query(updateQuery, (err, updatedRows) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }

        res.status(200).json({
          successful: true,
          message: 'Store successfully updated.',
        });
      });
    }
  });
};

//togglable store status
const statStore = (req, res, next) => {
  let storeId = req.params.id;
  
  if (storeId == "" || storeId == null) {
    res.status(404).json({
      successful: false,
      message: "Store does not exist in the database.",
    });
  } else {
    let query = `SELECT store_id, store_status FROM store_tbl WHERE store_id = ${storeId}`;
    
    database.db.query(query, (err, rows, result) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (rows.length > 0) {
          const storeStatus = rows[0].store_status;
          const updatedStatus = storeStatus === 'In service' ? 'Out of service' : 'In service';
          
          let updateQuery = `UPDATE store_tbl SET store_status = '${updatedStatus}' WHERE store_id = ${storeId}`;
          
          database.db.query(updateQuery, (err, rows, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              res.status(200).json({
                successful: true,
                message: `Store status successfully changed to ${updatedStatus}.`,
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
    statStore
}