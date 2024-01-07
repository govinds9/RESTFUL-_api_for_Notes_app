
class Apierror{
    constructor(
        statusCode,
        message= "something Went Wrong",
       
        
    ){
        
        
        this.statusCode= statusCode
        this.message = message
        this.success =false
       



    }
}

export {Apierror}