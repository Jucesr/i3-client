import React from 'react'
import { Form, Text, TextArea, asField} from 'informed'
import Cleave from 'cleave.js/dist/cleave-react';

import {replaceAll} from 'utils/'

export default class ModalForm extends React.Component {

  constructor(props){
    super(props);
  }

  render(){
    const {line_item, onSubmit, onSubmitText} = this.props
    return (
      <Form
        initialValues={line_item}
        onSubmit={onSubmit}
        onSubmitFailure={(errors) => console.log(errors)}
        id="Modal-form"
        className='Modal_form'
        >
          { ({ formApi }) => (
            <div>
              <CustomInput
                field='reference_number'
                raw={false}
                options={{
                  delimiter: '.',
                  delimiterLazyShow: true,
                  blocks: [2, 2, 2],
                  uppercase: true
                }}
              />
              <RegularInput textarea={true} field='description'/>

              <RegularInput field='unit_of_mesurement'/>

              <CustomInput
                field='quantity'
                options={{
                  numeral: true,
                  numeralDecimalScale: 5,
                  numeralThousandsGroupStyle: 'thousand'
                }}
                onValueChange={quantity => {
                  let unit_price = formApi.getValue('unit_price')
                  formApi.setValue('total', quantity * unit_price)
                }}
              />

              <CustomInput
                field='unit_price'
                options={{
                 prefix: '$',
                 numeral: true,
                 numeralThousandsGroupStyle: 'thousand',
                 rawValueTrimPrefix: true
                }}
                onValueChange={unit_price => {
                  let quantity = formApi.getValue('quantity')
                  formApi.setValue('total',quantity * unit_price)
                }}
               />

              <CustomInput
                field='total'
                options={{
                 prefix: '$',
                 numeral: true,
                 numeralThousandsGroupStyle: 'thousand',
                 rawValueTrimPrefix: true
                }}
                disabled={true}
               />
            <div className="Modal_form_section">
              <button className="Modal_form_submit" type="submit">
                {onSubmitText}
              </button>
            </div>

            </div>
          )}
      </Form>
    )
  };
}

const CustomInput = asField(({ fieldState, fieldApi,  ...props }) => {
  const {
    value
  } = fieldState;
  const {
    setValue,
    setTouched
  } = fieldApi;
  const {
    onChange,
    onBlur,
    forwardedRef,
    prefix,
    field,
    raw = true,
    ...rest
  } = props

  return (
    <div className="Modal_form_section">
      <div className="Modal_form_field_label" htmlFor={field}>{replaceAll(_.capitalize(field), '_', ' ')}</div>
      <Cleave
        {...rest}
        value={value}
        field={field}
        className="Modal_form_field_input"
        onChange={e => {
            let value = raw ? e.target.rawValue : e.target.value
            setValue(value)
            if (onChange) {
              onChange(e)
            }
        }}
      />
    </div>
  )
})

const RegularInput = ({field, textarea = false, ...rest}) => (
  <div className="">
    <div className="Modal_form_field_label" htmlFor={field}>{replaceAll(_.capitalize(field), '_', ' ')}</div>
    {textarea ? <TextArea {...rest} field={field} className="Modal_form_field_input"/> : <Text {...rest} field={field} className="Modal_form_field_input"/> }

  </div>
)
