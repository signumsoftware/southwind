import * as React from 'react'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { RegisterUserModel, RegisterUserMessage } from '../Southwind.Entities.Public'
import * as PublicClient from '../PublicClient'
import { ValueLine } from '@framework/Lines/ValueLine'
import { FormGroup } from '@framework/Lines/FormGroup'
import { FormControlReadonly } from '@framework/Lines/FormControlReadonly'
import { useAPI, useForceUpdate } from '@framework/Hooks'
import * as AppContext from '@framework/AppContext'
import { getToString, JavascriptMessage } from '@framework/Signum.Entities'
import { DoublePassword } from '@extensions/Authorization/Templates/DoublePassword'
import { useState } from 'react'
import { EntityFrame, TypeContext } from '@framework/TypeContext'
import { ValidationError } from '@framework/Services'
import { ifError } from '@framework/Globals'
import { GraphExplorer } from '@framework/Reflection'
import { ValidationErrors } from '@framework/Frames/ValidationErrors'
import Address from '../../Customers/Address'

export default function RegisterUser() {
  const params = useParams() as { reportsToEmployeeId: string };

  AppContext.useTitle(RegisterUserModel.niceName());

  return (
    <div id="hero" style={{ background: "url(" + AppContext.toAbsoluteUrl("/background_dark.jpg") + ")", backgroundSize: "cover" }}>
      <div style={{ margin: "0 auto", maxWidth: "680px", marginTop: "100px" }}>
        <div className="card shadow">
          <RegisterUserCard reportsToEmployeeId={params.reportsToEmployeeId} />
        </div>
      </div>
    </div>
  );
}

function RegisterUserCard(p: { reportsToEmployeeId: string }) {
  var registerUser = useAPI(() => PublicClient.API.getRegisterUser(p.reportsToEmployeeId), [p.reportsToEmployeeId]);

  const forceUpdate = useForceUpdate();

  const [success, setSuccess] = React.useState(false);

  if (registerUser == null) {
    return (
      <div className="card-body">
        <h2 className="title">{JavascriptMessage.loading.niceToString()}</h2>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card-body">
        <h2 className="card-title">{RegisterUserMessage.UserRegistered.niceToString()}</h2>
        <p className="card-text">{RegisterUserMessage.User0HasBeenRegisteredSuccessfully.niceToString().formatHtml(<strong>{registerUser.eMail}</strong>)}</p>
        <p className="card-text"><Link to={AppContext.toAbsoluteUrl("/auth/login")}>{RegisterUserMessage.GoToLoginPage.niceToString()}</Link></p>
      </div>
    );
  }

  function handleRegisterClick() {
    PublicClient.API.registerUser(registerUser!)
      .then(() => setSuccess(true))
      .catch(ifError(ValidationError, ve => {
        if (ve.modelState) {
          GraphExplorer.setModelState(registerUser!, ve.modelState, "");
          forceUpdate();
        }
      }));
  }

  var ctx = TypeContext.root(registerUser, { formGroupStyle: "FloatingLabel", frame: { revalidate: forceUpdate } as EntityFrame });
  return (
    <div className="card-body">
      <h2 className="card-title">{RegisterUserModel.niceName()}</h2>
      <p className="card-text">
        {RegisterUserMessage.PleaseFillTheFollowingFormToRegisterANewSouthwindEmployee.niceToString()}
      </p>
      <form onSubmit={e => { e.preventDefault(); /*handleRegisterClick(); */ }}>
        {ctx.value.reportsTo && <FormGroup ctx={ctx.subCtx(r => r.reportsTo)}>
          {id => <FormControlReadonly id={id} ctx={ctx.subCtx(r => r.reportsTo)}>{getToString(ctx.value.reportsTo)}</FormControlReadonly>}
        </FormGroup>
        }
        <div className="row">
          <div className="col-sm-4">
            <ValueLine ctx={ctx.subCtx(r => r.titleOfCourtesy)} valueLineType="DropDownList" optionItems={["Mr.", "Ms."]} />
          </div>
          <div className="col-sm-4">
            <ValueLine ctx={ctx.subCtx(r => r.firstName)} />
          </div>
          <div className="col-sm-4">
            <ValueLine ctx={ctx.subCtx(r => r.lastName)} />
          </div>
        </div>
        <Address ctx={ctx.subCtx(a => a.address)} inheritStyle />
        <ValueLine ctx={ctx.subCtx(r => r.eMail)} />
        <ValueLine ctx={ctx.subCtx(r => r.username)} />
        <DoublePassword ctx={ctx.subCtx(r => r.password)} initialOpen mandatory />
        <ValidationErrors entity={ctx.value} prefix="" />
        <div className="mt-4 d-flex">
          <button className="ms-auto btn btn-primary px-4" onClick={handleRegisterClick}>
            {RegisterUserMessage.Register.niceToString()}
          </button >
        </div>
      </form>
    </div>
  );
}
