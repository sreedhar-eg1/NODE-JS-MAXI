import React, { useState } from "react";

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import Auth from "./Auth";

const createLoginForm = () => ({
  email: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, email],
  },
  password: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
});

function Login(props) {
  const [loginForm, setLoginForm] = useState(createLoginForm);

  const inputChangeHandler = (input, value) => {
    setLoginForm((currentLoginForm) => {
      let isValid = true;
      for (const validator of currentLoginForm[input].validators) {
        isValid = isValid && validator(value);
      }

      return {
        ...currentLoginForm,
        [input]: {
          ...currentLoginForm[input],
          valid: isValid,
          value: value,
        },
      };
    });
  };

  const inputBlurHandler = (input) => {
    setLoginForm((currentLoginForm) => ({
      ...currentLoginForm,
      [input]: {
        ...currentLoginForm[input],
        touched: true,
      },
    }));
  };

  return (
    <Auth>
      <form
        onSubmit={(event) =>
          props.onLogin(event, {
            email: loginForm.email.value,
            password: loginForm.password.value,
          })
        }
      >
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("email")}
          value={loginForm.email.value}
          valid={loginForm.email.valid}
          touched={loginForm.email.touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("password")}
          value={loginForm.password.value}
          valid={loginForm.password.valid}
          touched={loginForm.password.touched}
        />
        <Button design="raised" type="submit" loading={props.loading}>
          Login
        </Button>
      </form>
    </Auth>
  );
}

export default Login;
