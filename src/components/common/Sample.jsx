import { useEffect, useState } from "react";
import { getUsersAPI } from "../../features/admin/adminAPI";
import { fetchAdminOrders } from "../../features/admin/adminAPI";

function Sample() {
  const [users, setUsers] = useState([]);
  const [orders,setOrders]=useState([])

  useEffect(()=>{
    getUsersAPI(1,"")
    .then((data)=>{
      setUsers(data.users || [])
    }).catch((err)=>{
      console.log(err)
    })

  },[])

  useEffect(()=>{
    fetchAdminOrders({page:1,pageSize:100,})
    .then((data)=>{
      setOrders(data.results || [])
        })
      .catch((err)=>{
        console.log(err)
      })

  },[])



  return (
    <>
      <h1>Users:{users.length}</h1>
      <ul>
        {users.map((user)=>(<li key={user.id}>{user.username} {""} {new Date(user.date_joined).toLocaleDateString("en-IN")}


        </li>))}
      </ul>

      <h1>Orders:{orders.length}</h1>
      <ul>
        {orders.map((order)=>(<li key={order.id}>{order.order_number} {""} {order.user_email} {""} {order.status}


        </li>))}
      </ul>
    </>
  );
}

export default Sample;
