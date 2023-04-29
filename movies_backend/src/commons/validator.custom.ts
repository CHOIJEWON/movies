import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'teasersArray', async: false })
export class TeasersArrayValidator implements ValidatorConstraintInterface {
  validate(value: string[], args: ValidationArguments) {
    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    return value.every((str) => !urlPattern.test(str));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Teasers array must only contain non-URL strings';
  }
}
