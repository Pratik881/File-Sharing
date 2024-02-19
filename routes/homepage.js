const router=require('express').Router()
router.get('/',(req,res)=>{
    res.render('fileupload')
})
module.exports=router;