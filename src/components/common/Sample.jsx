// // // import { useEffect, useState } from "react";
// // // import { getUsersAPI } from "../../features/admin/adminAPI";
// // // import { fetchAdminOrders } from "../../features/admin/adminAPI";

// import { useEffect } from "react"
// import { useState } from "react"
// import { getUsersAPI } from "../../features/admin/adminAPI"

// // import { useEffect } from "react";
// // import { useState } from "react"
// // // import { fetchCart } from "../../features/cart/cartAPI";
// // // import { fetchWishlist } from "../../features/wishlist/wishlistAPI";
// // // import { fetchUserProduct, fetchUserProducts } from "../../features/shop/shopAPI";
// // import { fetchAdminOrders } from "../../features/admin/adminAPI";





// function Sample() {
//   const [users,setUsers]=useState([])

//   useEffect(()=>{
//     async function loadUsers() {
//       try{
//         const data=await getUsersAPI()
//         setUsers(data.users||[]);
//         console.log(data.users[0])

//       }
//       catch(err){
//         console.log(err)
//       }

      
//     }
//     loadUsers()
//   },[])
//   return (
//     <>
//     {users.map((user)=>(<li key={user.id}>{user.id} {" "} {user.username} {" "} {new Date(user.date_joined).toLocaleString("en-In")}</li>))}
//     </>
//   )
// }

// export default Sample

// // function Sample() {
// //   // const [users, setUsers] = useState([]);
// //   const [orders,setOrders]=useState([])

// // //   useEffect(()=>{
// // //     getUsersAPI(1,"")
// // //     .then((data)=>{
// // //       setUsers(data.users || [])
// // //     }).catch((err)=>{
// // //       console.log(err)
// // //     })

// // //   },[])

// //   useEffect(()=>{
// //     fetchAdminOrders({pageSize:100,status:"cancelled,partially_cancelled"})
// //     .then((data)=>{
// //       setOrders(data.results || [])
// //         })
// //       .catch((err)=>{
// //         console.log(err)
// //       })

// //   },[])



// //   return (
// //     <>
// //       {/* <h1>Users:{users.length}</h1>
// //       <ul>
// //         {users.map((user)=>(<li key={user.id}>{user.username} {""} {new Date(user.date_joined).toLocaleDateString("en-IN")}


// //         </li>))}
// //       </ul> */}

// //       <h1>Orders:{orders.length}</h1>
// //       <ul>
// //         {orders.map((order)=>(<li key={order.id}>{order.order_number} {""} {order.user_email} {""} {order.product_name} {order.status}


// //         </li>))}
// //       </ul>
// //     </>
// //   );
// // }

// // // export default Sample;


// // // function Sample() {
// // //   const [cartItems,setCartItems]=useState([]);

// // //   useEffect(()=>{
// // //     async function loadCart() {
// // //       try{
// // //         const data=await fetchCart()
// // //         setCartItems(data.items)
// // //       }
// // //       catch(err){
// // //         console.log(err)
// // //       }
    
// // //     }
// // //     loadCart()
// // //   },[])
// // // return (
// // //     <>
// // //       <h2>Cart Items</h2>
// // //       <h1>{cartItems.length}</h1>

// // //       {cartItems.map((item) => (
// // //         <div key={item.id}>
// // //           <p>{item.product_name}</p>
// // //           <p>Quantity: {item.quantity}</p>
// // //         </div>
// // //       ))}
// // //     </>
// // //   );
// // // }

// // // export default Sample;



// // // function Sample() {
// // //   const [wishlistItem, setWishlistItem] = useState([]);

// // //   useEffect(() => {
// // //     async function loadWishlist() {
// // //       try {
// // //         const data = await fetchWishlist();
// // //         console.log(data.results[0].variant);

// // //         // Paginated response-ൽ results array ആണ് items
// // //         setWishlistItem(data.results);
// // //       } catch (err) {
// // //         console.error("Failed to fetch wishlist:", err);
// // //       }
// // //     }

// // //     loadWishlist();
// // //   }, []);

// // //   return (
// // //     <div>
// // //       <h2>Wishlist</h2>
// // //       <h1>{wishlistItem.length}</h1>

// // //       <ul>
// // //         {wishlistItem.map((item) => (
// // //           <li key={item.id}>
// // //             {item.id} {item.variant.product.name}
// // //           </li>
// // //         ))}
// // //       </ul>
// // //     </div>
// // //   );
// // // }

// // // export default Sample;



// // // function Sample() {
// // //   const [products,setProducts]=useState([])

// // //   useEffect(()=>{
// // //     async function loadProducts() {
// // //       try{
// // //         const data=await fetchUserProducts({ page_size: 100,});
// // //         setProducts(data.results)
// // //         console.log(data)
// // //         console.log(data.results[0]);

// // //       }
// // //       catch(err){
// // //         console.log(err)
// // //       }
      
// // //     }
// // //     loadProducts()
// // //   },[])
// // //   return (
// // //     <>
// // //     <div>
// // //   {products.filter((product) => product.variants?.length >= 2).map((product) => (
// // //     <div key={product.id}>
// // //       <h3>{product.name}</h3>

// // //       <ul>
// // //         {product.variants.map((variant) => (
// // //           <li key={variant.id}>
// // //             {variant.variant_name}
// // //           </li>
// // //         ))}
// // //       </ul>
// // //     </div>
// // //   ))}
// // // </div>
// // //     </>
// // //   )
// // // }

// // export default Sample