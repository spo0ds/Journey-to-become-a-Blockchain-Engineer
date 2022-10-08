import { s as styled$1, B as ButtonBase, g as getShade, j as jsx } from "./index.js";
import "react";
import "react-router-dom";
import "react-moralis";
const ButtonCustomStyled$1 = styled$1(ButtonBase)`
    background-color: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.backgroundColor;
}};

    span {
        color: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.textColor;
}};
        font-size: ${(p) => {
  var _a;
  return ((_a = p.customize) == null ? void 0 : _a.fontSize) + "px";
}};
    }

    svg {
        fill: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.textColor;
}};
    }

    :after {
        background-color: transparent;
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

    :hover {
        background-color: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.backgroundColor;
}};

        :after {
            background-color: ${(p) => {
  var _a;
  return ((_a = p.customize) == null ? void 0 : _a.onHover) === "lighten" ? getShade("light", 20) : getShade("dark", 20);
}};
        }
    }

    :active {
        :after {
            background-color: ${(p) => {
  var _a;
  return ((_a = p.customize) == null ? void 0 : _a.onHover) === "lighten" ? getShade("light", 40) : getShade("dark", 40);
}};
        }
    }
`;
var styles = {
  ButtonCustomStyled: ButtonCustomStyled$1
};
const {
  ButtonCustomStyled
} = styles;
const ButtonCustom = ({
  customize,
  ...props
}) => {
  return /* @__PURE__ */ jsx(ButtonCustomStyled, {
    customize,
    ...props
  });
};
export { ButtonCustom as default };
