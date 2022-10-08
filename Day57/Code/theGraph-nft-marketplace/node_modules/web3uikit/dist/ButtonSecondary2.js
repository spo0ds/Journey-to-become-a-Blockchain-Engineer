import { f as styled$1$1, h as ButtonBase, e as color$1, i as jsx$2 } from "./index.js";
import "react";
import "react-moralis";
import "react-router-dom";
const ButtonSecondaryStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${color$1.blueLight};
    border-color: ${color$1.blueLight};
    color: ${color$1.blue};

    :active {
        border-color: ${color$1.blue};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.blue};
    }
`;
var styles = {
  ButtonSecondaryStyled: ButtonSecondaryStyled$1
};
const {
  ButtonSecondaryStyled
} = styles;
const ButtonSecondary = ({
  ...props
}) => /* @__PURE__ */ jsx$2(ButtonSecondaryStyled, {
  ...props
});
export { ButtonSecondary as default };
