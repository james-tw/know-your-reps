function ListCtrl(t,e,n,r,a){var s=this;s.states=a.getStates(),t.state=n.stateId,t.reps=[],t.$watch("state",function(e){"undefined"!=typeof e&&(s.stateName=a.getStateName(e),a.getRepsByState(e,function(e){t.reps=e}),r.path("/"+e))});var i=e.current;t.$on("$locationChangeSuccess",function(t,n,a){-1===r.path().indexOf("rep")&&(e.current=i)})}function DetailCtrl(t,e,n){var r=this;t.rep={},null!=n.repId&&(e.getRepSummary(n.repId,function(e){t.rep=e}),e.getRepIndustry(n.repId,function(e){t.rep.industries=e}))}