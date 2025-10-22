package com.chub.exception.user;


import com.chub.exception.CustomRuntimeException;
import com.chub.exception.ExceptionCode;

public class UserException extends CustomRuntimeException {

    public UserException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }

    public static UserException userNotFound(){
        return new UserException(ExceptionCode.USER_NOT_FOUND);
    }

    public static UserException unauthorized(){
        return new UserException(ExceptionCode.UNAUTHORIZED_ACCESS);
    }

    public static UserException accessDenied(){
        return new UserException(ExceptionCode.ACCESS_DENIED);
    }

    public static UserException invalidUserFormat(){
        return new UserException(ExceptionCode.INVALID_USER_FORMAT);
    }

    public static UserException notLoggedIn(){
        return new UserException(ExceptionCode.NOT_LOGGED_IN);
    }
}
