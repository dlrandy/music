import {
  configure,
  defineRule,
  ErrorMessage,
  Form as VeeForm,
  Field as VeeField,
} from "vee-validate";
import {
  alpha_spaces as alphaSpaces,
  confirmed,
  email,
  max,
  min,
  required,
  max_value,
  min_value,
  not_one_of as excluded,
} from "@vee-validate/rules";
export default {
  install(app, options) {
    console.log(options);
    app.component("VeeForm", VeeForm);
    app.component("VeeField", VeeField);
    app.component("ErrorMessage", ErrorMessage);

    defineRule("alpha_spaces", alphaSpaces);
    defineRule("passwords_mismatch", confirmed);
    defineRule("email", email);
    defineRule("excluded", excluded);
    defineRule("country_excluded", excluded);
    defineRule("max", max);
    defineRule("max_value", max_value);
    defineRule("min", min);
    defineRule("min_value", min_value);
    defineRule("required", required);
    defineRule("tos", required);

    configure({
      generateMessage: (ctx) => {
        const messages = {
          required: `the field ${ctx.field} is required.`,
          min: `the field ${ctx.field} is too short.`,
          max: `the field ${ctx.field} is too long.`,
          alpha_spaces: `the field ${ctx.field} may only contain alphabetical characters and spaces.`,
          email: `the field ${ctx.field} must be a valid email.`,
          min_value: `the field ${ctx.field} is too low.`,
          max_value: `the field ${ctx.field} is too high.`,
          excluded: `You are not allowed to use this value for the field ${ctx.field}.`,
          country_excluded: `Due to restrictions, we do not accept users from this location.`,
          passwords_mismatch: `The password don't match.`,
          tos: `You must accept the Terms of Services.`,
        };
        console.log(ctx);
        const message = messages[ctx.rule.name]
          ? messages[ctx.rule.name]
          : `The field ${ctx.rule.name} is not valid.`;
        return message;
      },
      validateOnBlur: true,
      validateOnChange: true,
      validateOnInput: false,
      validateOnModelUpdate: true,
    });
  },
};
