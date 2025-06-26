//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Employees from '../Employees/Southwind.Employees'
import * as Customers from '../Customers/Southwind.Customers'


export namespace RegisterUserMessage {
  export const PleaseFillTheFollowingFormToRegisterANewSouthwindEmployee: MessageKey = new MessageKey("RegisterUserMessage", "PleaseFillTheFollowingFormToRegisterANewSouthwindEmployee");
  export const Register: MessageKey = new MessageKey("RegisterUserMessage", "Register");
  export const UserRegistered: MessageKey = new MessageKey("RegisterUserMessage", "UserRegistered");
  export const User0HasBeenRegisteredSuccessfully: MessageKey = new MessageKey("RegisterUserMessage", "User0HasBeenRegisteredSuccessfully");
  export const GoToLoginPage: MessageKey = new MessageKey("RegisterUserMessage", "GoToLoginPage");
  export const User0IsAlreadyRegistered: MessageKey = new MessageKey("RegisterUserMessage", "User0IsAlreadyRegistered");
}

export const RegisterUserModel: Type<RegisterUserModel> = new Type<RegisterUserModel>("RegisterUserModel");
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

