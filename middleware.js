
const passport = require('passport');

module.exports.isLoggedIn = (req, res, next) => {
    console.log('REQUEST USER...', req.user)
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}
