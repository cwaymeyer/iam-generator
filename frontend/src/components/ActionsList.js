import { Box, Spinner, Button, Tip, Text, PageHeader, Page } from "grommet";
import { CircleInformation } from "grommet-icons";

const ActionsList = ({
  actionsData,
  setActionsData,
  stagedStatement,
  setStagedStatement,
}) => {
  const disableActionInList = (actionName, whichList, access) => {
    const updateActionsDataCategory = (newArray) => {
      setActionsData((existingValues) => ({
        ...existingValues,
        [access]: newArray,
      }));
    };

    switch (typeof actionName) {
      case "string":
        let poppedAction;
        const updatedArraySingle = actionsData[whichList][access].map((val) => {
          if (val.name === actionName) {
            val.disabled = true;
            poppedAction = val;
          }
          return val;
        });
        updateActionsDataCategory(updatedArraySingle);

        return poppedAction;
      case "object": // array is an object in JS
        let poppedActions = [];
        const updatedArrayMultiple = actionsData[whichList][access].map(
          (val) => {
            if (actionName.includes(val.name)) {
              val.disabled = true;
              poppedActions.push(val);
            }
            return val;
          }
        );
        updateActionsDataCategory(updatedArrayMultiple);

        return poppedActions;
      default:
        throw `Action must be of type string or array ('object'). Received ${typeof actionName}.`;
    }
  };

  const addActionToStage = (action, whichList, accessLevel) => {
    // update stagedStatement
    let stagedActions = stagedStatement[whichList];
    if (!stagedActions[accessLevel]) {
      stagedActions[accessLevel] = [];
    }
    stagedActions[accessLevel].push(action);

    setStagedStatement((existingValues) => ({
      ...existingValues,
      [whichList]: stagedActions,
    }));
  };

  const handleActionSelection = (actionName) => {
    // get access level of selected action
    let accessLevel;
    for (const key in actionsData.actions) {
      for (let actionDetails of actionsData.actions[key]) {
        if (actionDetails.name === actionName) {
          accessLevel = key;
        }
      }
    }

    const action = disableActionInList(actionName, "actions", accessLevel);
    addActionToStage(action, "actions", accessLevel);
  };

  const handleWildcardSuggestion = (wildcard) => {
    const wildcardData = JSON.parse(wildcard);

    let actionNamesToDisable = [];
    if (wildcardData.type === "prefix") {
      actionsData.actions[wildcardData.accessLevel].forEach((action) => {
        const searchVal = wildcardData.name.slice(0, -1);
        const currActionPrefix = action.name.slice(0, searchVal.length);
        if (currActionPrefix === searchVal)
          actionNamesToDisable.push(action.name);
      });
    } else if (wildcardData.type === "suffix") {
      actionsData.actions[wildcardData.accessLevel].forEach((action) => {
        const searchVal = wildcardData.name.slice(1, wildcardData.name.length);
        const currActionSuffix = action.name.slice(-Math.abs(searchVal.length));
        if (currActionSuffix === searchVal)
          actionNamesToDisable.push(action.name);
      });
    } else {
      throw `Wildcard must be prefix or suffix. Received ${wildcardData.type}.`;
    }

    disableActionInList(
      wildcardData.name,
      "suggestions",
      wildcardData.accessLevel
    );
    disableActionInList(
      actionNamesToDisable,
      "actions",
      wildcardData.accessLevel
    );

    const wildcardObj = {
      name: wildcardData.name,
      prefix: wildcardData.servicePrefix,
    };
    addActionToStage(wildcardObj, "suggestions", wildcardData.accessLevel);
  };

  const handleAddAllSelection = (accessLevel) => {
    // update actionsData
    const updatedArray = actionsData.actions[accessLevel].map((val) => {
      val.disabled = true;
      return val;
    });

    setActionsData((existingValues) => ({
      ...existingValues,
      [accessLevel]: updatedArray,
    }));

    // update stagedStatement
    let stagedActions = stagedStatement.actions;
    stagedActions[accessLevel] = actionsData.actions[accessLevel];

    setStagedStatement((existingValues) => ({
      ...existingValues,
      actions: stagedActions,
    }));
  };

  // const handleAllActionsSelection = () => {};

  const actionsDataKeys = Object.keys(actionsData.actions);

  if (actionsDataKeys.length) {
    return (
      <Box margin={{ top: "small", bottom: "medium" }}>
        <Button
          color="primary"
          label="ADD ALL ACTIONS (*)"
          size="small"
          pad="xsmall"
          alignSelf="center"
          hoverIndicator
          value="*"
          fill={false}
          plain
          reverse
        />
        {actionsDataKeys.map((accessLevel) => {
          return (
            <Box
              justify="stretch"
              fill="horizontal"
              align="start"
              alignContent="start"
              direction="row"
              wrap
              overflow="auto"
            >
              <Page>
                <PageHeader
                  title={accessLevel}
                  actions={
                    <Button
                      label="Add all"
                      color="primary"
                      size="small"
                      primary
                      value={accessLevel}
                      onClick={(e) => handleAddAllSelection(e.target.value)}
                    />
                  }
                  size="small"
                  margin={{
                    left: "small",
                    top: "xxsmall",
                    right: "xxsmall",
                    bottom: "xxsmall",
                  }}
                />
              </Page>
              {actionsData.suggestions[accessLevel].length
                ? actionsData.suggestions[accessLevel].map((suggestion) => {
                    return (
                      <Box key={suggestion.name + Date.now()}>
                        <Button
                          color="primary"
                          label={suggestion.name}
                          size="small"
                          active
                          fill={false}
                          hoverIndicator
                          margin="xxsmall"
                          disabled={suggestion.disabled}
                          value={JSON.stringify(suggestion)}
                          onClick={(e) =>
                            handleWildcardSuggestion(e.target.value)
                          }
                        ></Button>
                      </Box>
                    );
                  })
                : null}
              {actionsData.actions[accessLevel].map((action) => {
                return (
                  <Box key={action.name + Date.now()}>
                    <Button
                      color="primary"
                      label={action.name}
                      size="small"
                      fill={false}
                      hoverIndicator
                      margin="xxsmall"
                      disabled={action.disabled}
                      reverse
                      value={action.name}
                      onClick={(e) =>
                        handleActionSelection(e.currentTarget.value)
                      }
                      icon={
                        <Tip
                          plain
                          dropProps={{ align: { bottom: "top" } }}
                          size="small"
                          content={
                            <Box
                              pad="small"
                              gap="small"
                              margin="small"
                              width={{ max: "medium" }}
                              background="lightSecondary"
                              round="small"
                            >
                              <Text size="small">{action.description}</Text>
                            </Box>
                          }
                        >
                          <Box round="small">
                            <CircleInformation
                              size="small"
                              background="secondary"
                            />
                          </Box>
                        </Tip>
                      }
                    />
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    );
  } else {
    return <Spinner margin="medium" />;
  }
};

export default ActionsList;
