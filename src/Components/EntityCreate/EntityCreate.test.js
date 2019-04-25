import React from "react";
import { shallow, mount } from "enzyme";
import EntityCreate from "./EntityCreate"

const setUp = (props = {}) => {
  const component = shallow(<EntityCreate />);
  return component;
};

const findByTestAttr = (component, attr) => {
  const wrapper = component.find(`[data-test='${attr}']`);
  return wrapper;
};

describe("EntityCreate Component", () => {

  let component;
  beforeEach(() => {
    component = setUp();
  });

  it('Should render without errors', () => {
    const wrapper = findByTestAttr(component, 'entityCreate');
    expect(wrapper.length).toBe(1);
  });

  it("Should show form upload URL", () => {
    const component = mount(<EntityCreate />);
    const inputName = component.find("input[data-test='input-name']");
    const inputUrl = component.find("input[data-test='input-url']");

    expect(inputName.length).toBe(1);
    expect(inputUrl.length).toBe(1);
  })

  it("Should validation on submit", () => {
    const component = shallow(<EntityCreate />);
    const inputName = () => component.find("[data-test='input-name']");
    const inputUrl  = () => component.find("[data-test='input-url']");
    const submitForm = component.find(".form-create-entity-url");

    submitForm.simulate("submit", {
      preventDefault: () => {
      }
    });
    expect(component.state().isNameFieldInvalid).toBe(true);
    expect(component.state().isUrlFieldInvalid).toBe(true);
  });

  it("Should call api if validate successfully", () => {
    const component = shallow(<EntityCreate />);
    const inputName = () => component.find("[data-test='input-name']");
    const inputUrl  = () => component.find("[data-test='input-url']");
    const submitForm = component.find(".form-create-entity-url");
    const numberOfNewEntitiesAtPresent = component.state().listOfNewEntities.length;

    inputName().simulate("change", {
      target: {
        name: "name",
        value: "value"
      }
    });

    inputUrl().simulate("change", {
      target: {
        name: "entityUrl",
        value: "url"
      }
    });

    submitForm.simulate("submit");
    expect(component.state().isNameFieldInvalid).toBe(false);
    expect(component.state().isUrlFieldInvalid).toBe(false);
  })

  it("Should show error after input name, url null", () => {
    const component = shallow(<EntityCreate />);
    const instance = component.instance();
    instance.handleOnChangeInputText({
      target: {
        name: 'name',
        value: 'new name'
      }
    });
    instance.handleOnChangeInputText({
      target: {
        name: 'entityUrl',
        value: ''
      }
    });

    expect(component.state('isUrlFieldInvalid')).toBe(true);
  });

  it("Should show error after input url, name null", () => {
    const component = shallow(<EntityCreate />);
    const inputName = () => component.find("[data-test='input-name']");
    const inputUrl  = () => component.find("[data-test='input-url']");
    
    inputName().simulate("change", {
      target: {
        name: "name",
        value: ""
      }
    });

    inputUrl().simulate("change", {
      target: {
        name: "entityUrl",
        value: "url"
      }
    });

    expect(component.state().isNameFieldInvalid).toBe(true);
  })
});
