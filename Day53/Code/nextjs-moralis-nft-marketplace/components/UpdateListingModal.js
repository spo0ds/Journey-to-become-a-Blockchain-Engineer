import { Modal, Input } from "web3uikit"

export default function UpdateListingModal({ nftAddress, tokenId, isVisible }) {
    return (
        <Modal
            isVisible={isVisible}
        >
            <Input
                label="Update Listing price in L1 Currency(ETH)"
                name="New listing price"
                type="number"
            />

        </Modal>
    )
} 