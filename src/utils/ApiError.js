class ApiError extends Error{
    constructor(
        stastusCode,
        message = "Something went wrong",
        errors =[],
        stack = ""
    ){
        super(message);
        this.stastusCode = stastusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors
        
        if(stack){
            this.stack= stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }

}

export {ApiError}