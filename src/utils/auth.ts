import { HttpError } from "../errors/http-error";


export function validateInput(email: string, password: string){

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){        
        throw new HttpError("Email entered is invalid.", 400);
    }

    if(!/^^(?=.*[A-Za-z]).{8,}$/.test(password)){
        throw new HttpError("Password must be at least 8 characters long and contain at least one letter.", 400);
    }
    
    return true;
}
