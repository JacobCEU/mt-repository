const bcrypt = require('bcryptjs');
const database = require('../models/connection_db');

const addUser = async (req, res, next) => {
  let userName = req.body.name;
  let userAge = req.body.age;
  let userContactNo = req.body.contact;
  let username = req.body.username;
  let password = req.body.password;

  if (userName === '' || userName === null || userAge === '' || userAge === null || userContactNo === '' || userContactNo === null || username === '' || username === null || password === '' || password === null ) {
    res.status(404).json({
      successful: false,
      message: 'User has incomplete credentials.',
    });
  } else {
    let userCheckQuery = `SELECT user_contactNo FROM user_tbl WHERE user_contactNo = '${userContactNo}'`;
    let usernameCheckQuery = `SELECT username FROM user_tbl WHERE username = '${username}'`;

    database.db.query(userCheckQuery, async (err, userRows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (userRows.length > 0) {
          res.status(400).json({
            successful: false,
            message: 'This contact number is already registered to another account.',
          });
        } else {
          database.db.query(usernameCheckQuery, async (err, usernameRows) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              if (usernameRows.length > 0) {
                res.status(400).json({
                  successful: false,
                  message: 'This username already exists.',
                });
              } else {
                let insertQuery = `INSERT INTO user_tbl (user_name, user_age, user_contactNo, username, password) VALUES (?, ?, ?, ?, ?)`;
                let hashedPassword = await bcrypt.hash(password, 10);

                database.db.query(insertQuery, [userName, userAge, userContactNo, username, hashedPassword], (err, rows) => {
                  if (err) {
                    res.status(500).json({
                      successful: false,
                      message: err,
                    });
                  } else {
                    res.status(200).json({
                      successful: true,
                      message: 'Successfully signed up new user!',
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
 
const login = async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username === '' || username === null || password === '' || password === null) {
    res.status(400).json({
      successful: false,
      message: 'Invalid input',
    });
  } else {
    let searchQuery = `SELECT password FROM user_tbl WHERE username = '${username}'`;

    database.db.query(searchQuery, async (err, rows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (rows.length === 0) {
          res.status(500).json({
            successful: false,
            message: 'Invalid input',
          });
        } else {
          let storedPassword = rows[0].password;
          let isPasswordMatched = await bcrypt.compare(password, storedPassword);

          if (isPasswordMatched) {
            res.status(200).json({
              successful: true,
              message: 'Logged in successfully',
            });
          } else {
            res.status(500).json({
              successful: false,
              message: 'Incorrect credentials',
            });
          }
        }
      }
    });
  }
};
 

 //view all user details
const viewAllUser = (req,res,next)=>{
    let query = `SELECT user_id, username, password, user_name, user_age, user_contactNo FROM user_tbl`
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
                    message: "Successfully got all user details",
                    count: rows.length,
                    data: rows
                })
            } else {
                res.status(200).json({
                    successful: true,
                    message: "No User available in the database",
                })
            }
        }
    })
}

 //view user details
 const viewUserDetails = (req,res,next)=>{

  const userId = req.params.id;

    let query = `SELECT user_name, user_contactNo, user_age, username, password FROM user_tbl WHERE user_id = ${userId}`;
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
                    message: "Successfully got user details",
                    count: rows.length,
                    data: rows
                })
            } else {
                res.status(200).json({
                    successful: true,
                    message: "No User available in the database",
                })
            }
        }
    })
}

  //update
  const updateUser = (req, res, next) => {
    const userId = req.params.id;
    const userContactNo = req.body.contact;
    const password = req.body.password;
  
    if (
      userId === '' ||
      userId === null ||
      userContactNo === '' ||
      userContactNo === null ||
      password === '' ||
      password === null
    ) {
      return res.status(400).json({
        successful: false,
        message: 'Some inputs are missing',
      });
    }
  
    const selectQuery = `SELECT user_id FROM user_tbl WHERE user_id = ${userId}`;
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
          message: 'User does not exist.',
        });
      }
  
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }
  
        const updateQuery = `UPDATE user_tbl SET user_contactNo = '${userContactNo}', password = '${hashedPassword}' WHERE user_id = ${userId}`;
        database.db.query(updateQuery, (err, updatedRows) => {
          if (err) {
            return res.status(500).json({
              successful: false,
              message: err,
            });
          }
  
          res.status(200).json({
            successful: true,
            message: 'User successfully updated.',
          });
        });
      });
    });
  };

//delete
const deleteUser = (req, res, next) => {
  let userId = req.params.id;
  if (userId == "" || userId == null) {
    
    res.status(404).json({
      successful: false,
      message: "User id is not found",
    });
  } else {
    let query = `SELECT user_id FROM user_tbl WHERE user_id = ${userId}`;
    
    
    database.db.query(query, (err, rows, result) => {
      if (err) {
        
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (rows.length > 0) {
          
          let deleteQuery = `DELETE FROM user_tbl WHERE user_id = ${userId}`;
          
          database.db.query(deleteQuery, (err, rows, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              res.status(200).json({
                successful: true,
                message: "User is successfully deleted!",
              });
            }
          });
        } else {
          res.status(400).json({
            successful: false,
            message: "User id does not exist.",
          });
        }
      }
    });
  }
};


module.exports = {
    addUser,
    viewAllUser,
    viewUserDetails,
    updateUser,
    login,
    deleteUser
}