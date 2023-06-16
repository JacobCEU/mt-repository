const bcrypt = require('bcryptjs');
const database = require('../models/connection_db');

//sign up user
const addUser = async (req, res, next) => {
  let userName = req.body.name;
  let userBirth = req.body.birthDate;
  let userContactNo = req.body.contact;
  let username = req.body.username;
  let password = req.body.password;

  if (
    userName === '' ||
    userName === null ||
    userBirth === '' ||
    userBirth === null ||
    userContactNo === '' ||
    userContactNo === null ||
    username === '' ||
    username === null ||
    password === '' ||
    password === null
  ) {
    res.status(404).json({
      successful: false,
      message: 'User has incomplete credentials.',
    });
  } else if (username.includes(' ')) {
    res.status(400).json({
      successful: false,
      message: 'Username must not contain spaces.',
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
                if (password.length < 7) {
                  res.status(400).json({
                    successful: false,
                    message: 'Password is too weak, please enter more than 7 characters.',
                  });
                } else if (!/\d/.test(password)) {
                  res.status(400).json({
                    successful: false,
                    message: 'Password must contain at least 1 numerical character, please try again.',
                  });
                } else if (!userContactNo.startsWith('+63')) {
                  res.status(400).json({
                    successful: false,
                    message: "A Philippine contact number is required starting with '+63'.",
                  });
                } else if (userContactNo.length !== 13) {
                  res.status(400).json({
                    successful: false,
                    message: 'That is not a valid contact number length.',
                  });
                } else if (!/^\+?[0-9]+$/.test(userContactNo)) {
                  res.status(400).json({
                    successful: false,
                    message: 'That is not a valid contact number.',
                  });
                } else {
                  let today = new Date();
                  let birthDate = new Date(userBirth);
                  let age = today.getFullYear() - birthDate.getFullYear();
                  let monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }

                  if (age < 18) {
                    res.status(400).json({
                      successful: false,
                      message: 'You must be 18 years or older to register.',
                    });
                  } else {
                    let insertQuery = `INSERT INTO user_tbl (user_name, user_birthDate, user_age, user_contactNo, username, password, user_status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    let hashedPassword = await bcrypt.hash(password, 10);

                    database.db.query(
                      insertQuery,
                      [userName, userBirth, age, userContactNo, username, hashedPassword, 'Active'],
                      (err, rows) => {
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
                      }
                    );
                  }
                }
              }
            }
          });
        }
      }
    });
  }
};

//login
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
 
//view all user (IN DATABASE) details
const viewAllUser = (req,res,next)=>{
    let query = `SELECT user_id, username, user_name, user_contactNo, user_status FROM user_tbl`
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

//view specific user details
 const viewUserDetails = (req,res,next)=>{

  const userId = req.params.id;

    let query = `SELECT user_name, username, user_contactNo, user_birthDate, user_age, user_status FROM user_tbl WHERE user_id = ${userId}`;
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
    const username = req.body.username;
    const password = req.body.password;
  
    if (userId === '' || userId === null || password === '' || password === null || username === '' || username === null) {
      return res.status(400).json({
        successful: false,
        message: 'Some inputs are missing',
      });
    } else if (username.includes(' ')) {
      return res.status(400).json({
        successful: false,
        message: 'New username must not contain spaces.',
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
  
      const usernameCheckQuery = `SELECT user_id FROM user_tbl WHERE username = '${username}' AND user_id != ${userId}`;
      database.db.query(usernameCheckQuery, (err, usernameRows) => {
        if (err) {
          return res.status(500).json({
            successful: false,
            message: err,
          });
        }
  
        if (usernameRows.length > 0) {
          return res.status(400).json({
            successful: false,
            message: 'This username already exists.',
          });
        }
  
        const passwordCheckQuery = `SELECT password FROM user_tbl WHERE user_id = ${userId}`;
        database.db.query(passwordCheckQuery, (err, passwordRows) => {
          if (err) {
            return res.status(500).json({
              successful: false,
              message: err,
            });
          }
  
          bcrypt.compare(password, passwordRows[0].password, (err, passwordMatch) => {
            if (err) {
              return res.status(500).json({
                successful: false,
                message: err,
              });
            }
  
            if (passwordMatch) {
              return res.status(400).json({
                successful: false,
                message: 'New password cannot be same as current password',
              });
            }
  
            if (password.length < 7) {
              return res.status(400).json({
                successful: false,
                message: 'Password is too weak, please enter more than 7 characters.',
              });
            }
  
            if (!/\d/.test(password)) {
              return res.status(400).json({
                successful: false,
                message: 'Password must contain at least 1 numerical character, please try again.',
              });
            }
  
            bcrypt.hash(password, 10, (err, hashedPassword) => {
              if (err) {
                return res.status(500).json({
                  successful: false,
                  message: err,
                });
              }
  
              const updateQuery = `UPDATE user_tbl SET username = '${username}', password = '${hashedPassword}' WHERE user_id = ${userId}`;
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
        });
      });
    });
};
    
//togglable user status
const statUser = (req, res, next) => {
  let userId = req.params.id;

  if (userId === '' || userId === null) {
    res.status(404).json({
      successful: false,
      message: 'User id is not found',
    });
  } else {
    let selectQuery = `SELECT user_id, user_status FROM user_tbl WHERE user_id = ${userId}`;

    database.db.query(selectQuery, (err, rows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err,
        });
      } else {
        if (rows.length > 0) {
          let updatedStatus = rows[0].user_status === 'Active' ? 'Inactive' : 'Active';
          let updateQuery = `UPDATE user_tbl SET user_status = '${updatedStatus}' WHERE user_id = ${userId}`;

          database.db.query(updateQuery, (err, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err,
              });
            } else {
              res.status(200).json({
                successful: true,
                message: `User status successfully updated to ${updatedStatus}.`,
              });
            }
          });
        } else {
          res.status(400).json({
            successful: false,
            message: 'User id does not exist.',
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
    statUser
}