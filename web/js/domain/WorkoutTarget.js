define([
    'json!rest/workouts/targets'
], function (
    targets
) {

    /**
     * @name WorkoutTarget
     * @constructor
     */
    function WorkoutTarget (workoutTarget) {
        this.id = workoutTarget.id;
        this.name = workoutTarget.name;
        this.editable = workoutTarget.editable !== false;
    }

    WorkoutTarget.prototype.toString = function () {
        return this.name;
    };

    WorkoutTarget.all = [];

    WorkoutTarget.targets = targets.reduce(function (targets, target) {
        targets[target.id] = WorkoutTarget.all[WorkoutTarget.all.length] = new WorkoutTarget(target);
        return targets;
    }, {});

    WorkoutTarget.allTargets = function () {
        return WorkoutTarget.all.map(function (target) {
            return Object.create(target);
        });
    };

    WorkoutTarget.filterSelected = function (target) {
        return target.selected;
    };

    return WorkoutTarget;

});
