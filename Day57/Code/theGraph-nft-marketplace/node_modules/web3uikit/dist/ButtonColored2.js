import { b as Ce$1$1, d as getShade, e as color$1, f as styled$1$1, h as ButtonBase, i as jsx$2 } from "./index.js";
import "react";
import "react-moralis";
import "react-router-dom";
const coloredShades = Ce$1$1`
    :after {
        background-color: ${getShade("light", 90)};
    }

    :hover {
        :after {
            background-color: ${getShade("light", 70)};
        }
    }

    :active {
        :after {
            background-color: ${getShade("light", 50)};
        }
    }
`;
const coloredRed = Ce$1$1`
    background-color: ${color$1.red};
    border-color: ${color$1.red};
    color: ${color$1.red};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.red};
    }

    ${coloredShades}
`;
const coloredGreen = Ce$1$1`
    background-color: ${color$1.green};
    border-color: ${color$1.green};
    color: ${color$1.green};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.green};
    }

    ${coloredShades}
`;
const coloredBlue = Ce$1$1`
    background-color: ${color$1.blue};
    border-color: ${color$1.blue};
    color: ${color$1.blue};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.blue};
    }

    ${coloredShades}
`;
const coloredYellow = Ce$1$1`
    background-color: ${color$1.yellow};
    border-color: ${color$1.yellow};
    color: ${color$1.yellow};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.yellow};
    }

    ${coloredShades}
`;
const getColored = (color2) => {
  switch (color2) {
    case "red":
      return coloredRed;
    case "green":
      return coloredGreen;
    case "blue":
      return coloredBlue;
    case "yellow":
      return coloredYellow;
    default:
      return;
  }
};
const ButtonColoredStyled$1 = styled$1$1(ButtonBase)`
    :after {
        background-color: ${getShade("dark", 0)};
        content: '';
        display: block;
        height: 100%;
        left: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        transition: all 0.3s ease;
        width: 100%;
        z-index: 0;
    }

    ${({
  color: color2
}) => color2 && getColored(color2)}
`;
var styles = {
  ButtonColoredStyled: ButtonColoredStyled$1
};
const {
  ButtonColoredStyled
} = styles;
const ButtonColored = ({
  color: color2,
  ...props
}) => /* @__PURE__ */ jsx$2(ButtonColoredStyled, {
  color: color2,
  ...props
});
export { ButtonColored as default };
