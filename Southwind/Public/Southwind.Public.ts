//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '@framework/Reflection'
import * as Entities from '@framework/Signum.Entities'
import * as Employees from '../Employees/Southwind.Employees'
import * as Customers from '../Customers/Southwind.Customers'


export module RegisterUserMessage {
  export const PleaseFillTheFollowingFormToRegisterANewSouthwindEmployee = new MessageKey("RegisterUserMessage", "PleaseFillTheFollowingFormToRegisterANewSouthwindEmployee");
  export const Register = new MessageKey("RegisterUserMessage", "Register");
  export const UserRegistered = new MessageKey("RegisterUserMessage", "UserRegistered");
  export const User0HasBeenRegisteredSuccessfully = new MessageKey("RegisterUserMessage", "User0HasBeenRegisteredSuccessfully");
  export const GoToLoginPage = new MessageKey("RegisterUserMessage", "GoToLoginPage");
  export const User0IsAlreadyRegistered = new MessageKey("RegisterUserMessage", "User0IsAlreadyRegistered");
}

export const RegisterUserModel = new Type<RegisterUserModel>("RegisterUserModel");
export interface RegisterUserModel extends Entities.ModelEntity {
  Type: "RegisterUserModel";
  reportsTo: Entities.Lite<Employees.EmployeeEntity> | null;
  titleOfCourtesy: string;
  firstName: string;
  lastName: string;
  address: Customers.AddressEmbedded;
  username: string;
  eMail: string;
  password: string;
}


