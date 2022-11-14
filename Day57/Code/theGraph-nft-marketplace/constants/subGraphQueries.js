import { gql } from "apollo/client"

const GET_ACTIVE_ITEMS = gql`
 {
     activeItems(first:5, where:{buyer:"0x00000000"})
     {
         id
         buyer
         seller
         nftAddress
         tokenId
         price
     }
 }
`

export default GET_ACTIVE_ITEMS