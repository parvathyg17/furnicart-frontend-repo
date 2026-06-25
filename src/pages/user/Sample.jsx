import { useSelector } from "react-redux"


function Sample() {
    const itemCount=useSelector((state)=>state.cart.itemCount)
  return (
    <div>itemcount={itemCount}</div>
  )
}

export default Sample