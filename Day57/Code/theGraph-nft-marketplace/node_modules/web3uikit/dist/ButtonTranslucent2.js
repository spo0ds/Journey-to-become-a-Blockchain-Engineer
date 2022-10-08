import { f as styled$1$1, h as ButtonBase, d as getShade, e as color$1, i as jsx$2 } from "./index.js";
import "react";
import "react-moralis";
import "react-router-dom";
const ButtonTranslucentStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${getShade("dark", 20)};
    color: ${color$1.white};

    :active {
        border: 2px solid transparent;
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.white};
    }
`;
var styles = {
  ButtonTranslucentStyled: ButtonTranslucentStyled$1
};
const {
  ButtonTranslucentStyled
} = styles;
const ButtonTranslucent = ({
  ...props
}) => /* @__PURE__ */ jsx$2(ButtonTranslucentStyled, {
  ...props
});
export { ButtonTranslucent as default };
