import { Button, makeStyles } from "@material-ui/core"
import { useEthers } from "@usedapp/core"

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(4),
        display: "flex",
        justifyContent: "flex-end",
        gap: theme.spacing(1)
    },
}))


export const Header = () => {
    const classes = useStyles()

    const { account, activateBrowserWallet, deactivate } = useEthers()

    const isConnected = account !== undefined

    return (
        <div className={classes.container}>
            {isConnected ? (
                <Button variant="contained" onClick={deactivate}>
                    Disconnect
                </Button>
            ) : (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => activateBrowserWallet()}
                >
                    Connect
                </Button>
            )}
        </div>
    )
}