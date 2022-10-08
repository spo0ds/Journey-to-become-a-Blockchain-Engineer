import { s as styled$1, B as ButtonBase, c as color, a as gradientColors, j as jsx } from "./index.js";
import "react";
import "react-router-dom";
import "react-moralis";
const ButtonOutlineStyled$1 = styled$1(ButtonBase)`
    background-color: ${color.white};
    border-color: ${color.beauBlue};
    color: ${color.blue};

    :hover {
        background-color: ${gradientColors.beauBlue};
        border-color: transparent;
        color: ${color.blue};

        svg {
            color: ${color.blue};
        }
    }

    :active {
        box-shadow: 0px 0px 0px 2px ${color.blueDark};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        color: ${color.blue};
    }
`;
var styles = {
  ButtonOutlineStyled: ButtonOutlineStyled$1
};
const {
  ButtonOutlineStyled
} = styles;
const ButtonOutline = ({
  ...props
}) => /* @__PURE__ */ jsx(ButtonOutlineStyled, {
  ...props
});
export { ButtonOutline as default };
