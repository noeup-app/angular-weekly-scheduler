angular.module('weeklyScheduler')
  .directive('inject', [function () {

    return {
      link: function ($scope, $element, $attrs, controller, $transclude) {

        // TODO : refactor 
        // Sigle responsability
        function resize(el){
          //console.log(el[0].children[0])
          var height = el[0].children[0].offsetHeight;
          var nbLines = Object.keys($scope.item.schedules).length;

          el[0].children[0].style.height = height * nbLines + 'px';
          el[0].children[0].style['line-height'] = height * nbLines + 'px';
        }

        if (!$transclude) {
          throw 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found.';
        }
        var innerScope = $scope.$new();
        $transclude(innerScope, function (clone) {
          $element.empty();
          $element.append(clone);
          resize($element)
          $element.on('$destroy', function () {
            innerScope.$destroy();
          });
        });
      }
    };
  }]);