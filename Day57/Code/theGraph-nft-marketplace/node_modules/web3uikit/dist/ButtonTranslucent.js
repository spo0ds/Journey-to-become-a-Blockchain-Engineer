import { s as styled$1, B as ButtonBase, g as getShade, c as color, j as jsx } from "./index.js";
import "react";
import "react-router-dom";
import "react-moralis";
const ButtonTranslucentStyled$1 = styled$1(ButtonBase)`
    background-color: ${getShade("dark", 20)};
    color: ${color.white};

    :active {
        border: 2px solid transparent;
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        fill: ${color.white};
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
}) => /* @__PURE__ */ jsx(ButtonTranslucentStyled, {
  ...props
});
export { ButtonTranslucent as default };
