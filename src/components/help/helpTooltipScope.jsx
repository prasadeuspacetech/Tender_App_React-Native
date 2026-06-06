import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const HelpTooltipScopeContext = createContext(null);

/** Ensures only one field help tooltip is open within a screen/section. */
export const HelpTooltipScope = ({ children }) => {
  const [openId, setOpenId] = useState(null);

  const value = useMemo(
    () => ({
      openId,
      setOpenId,
      closeAll: () => setOpenId(null),
    }),
    [openId],
  );

  return (
    <HelpTooltipScopeContext.Provider value={value}>
      {children}
    </HelpTooltipScopeContext.Provider>
  );
};

export const useHelpTooltipScope = () => useContext(HelpTooltipScopeContext);

/** @returns {{ open: () => void, close: () => void, isOpen: boolean } | null} */
export const useHelpTooltipRegistration = (tooltipId) => {
  const scope = useHelpTooltipScope();

  const open = useCallback(() => {
    if (!scope || !tooltipId) return;
    scope.setOpenId(tooltipId);
  }, [scope, tooltipId]);

  const close = useCallback(() => {
    if (!scope || !tooltipId) return;
    if (scope.openId === tooltipId) {
      scope.setOpenId(null);
    }
  }, [scope, tooltipId]);

  if (!scope || !tooltipId) {
    return null;
  }

  return {
    open,
    close,
    isOpen: scope.openId === tooltipId,
  };
};
