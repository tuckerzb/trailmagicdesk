import React from "react";
import ReactDOM from "react-dom"

const PayPalButton = paypal.Buttons.driver("react", { React, ReactDOM });

const RenderPayPalButton = (props) => {
  const createOrder = (data, actions) =>{
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: props.amount,
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture();
  };

  return (
    <PayPalButton
      createOrder={(data, actions) => createOrder(data, actions)}
      onApprove={(data, actions) => onApprove(data, actions)}
    />
  );
}

export default RenderPayPalButton;