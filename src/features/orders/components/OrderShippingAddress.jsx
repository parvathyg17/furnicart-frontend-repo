// export default function OrderShippingAddress(
//   {
//     order,
//   },
// ) {

//   return (

//     <div className="odl-info-card">

//       <h3>
//         Shipping address
//       </h3>

//       <p>

//         <strong>
//           {order.shipping_name}
//         </strong>

//         {order.shipping_phone
//           ? (
//             <>
//               {" · "}
//               {order.shipping_phone}
//             </>
//           )
//           : null}

//         <br />

//         {[
//           order.shipping_address_line,
//           order.shipping_city,
//           `${order.shipping_state} ${order.shipping_pincode}`,
//         ].filter(Boolean).join(", ")}
//       </p>
//     </div>
//   );
// }
