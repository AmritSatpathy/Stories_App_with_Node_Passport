const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Story = require('../models/story')
//@desc Login/landing page
//@ route GEt / 
router.get('/',ensureGuest,(req,res) => {
    res.render('login',{
        layout: 'login',
    })
})
//@desc dashboard/
//@ route GEt / 
router.get('/Dashboard',ensureAuth, async (req,res) => {
    try{
        const stories = await Story.find({ user: req.user.id }).lean()
        res.render('dashboard', {
            name: req.user.firstname,
            stories
        }
        )
    }catch(err){
        console.error(err)
        res.render('error/500')
    }
    
})


module.exports = router