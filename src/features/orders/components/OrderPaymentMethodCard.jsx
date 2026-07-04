// import {
//   PAYMENT_LABELS,
//   paymentStatusFollowLine,
// } from "../orderUi.js";

// export default function OrderPaymentMethodCard(
//   {
//     order,
//   },
// ) {

//   return (

//     <div className="odl-info-card">

//       <h3>
//         Payment method
//       </h3>

//       <p>
//         {PAYMENT_LABELS[order.payment_method] || order.payment_method}

//         {paymentStatusFollowLine(order)
//           ? (
//             <>
//               <br />

//               <span style={{ fontSize: "0.85rem", color: "#6b635c" }}>
//                 Payment status:
//                 {" "}

//                 {paymentStatusFollowLine(order)}
//               </span>
//             </>
//           )
//           : order.payment_method === "cod"
//             ? (
//               <>
//                 <br />

//                 <span style={{ fontSize: "0.85rem", color: "#6b635c" }}>
//                   Payment is collected when your order is delivered.
//                 </span>
//               </>
//             )
//             : null}
//       </p>
//     </div>
//   );
// }
