define([
    'util/dom',
    'widgets/dialog',
    'domain/Workout',
    'text!fragments/create-workout-dialog.html',
    'text!fragments/select-workout-dialog.html',
    'text!fragments/start-workout.html'
], /** @exports workouts */ function (
    dom,
    dialog,
    Workout,
    createWorkoutTemplate,
    selectWorkoutTemplate,
    startWorkoutTemplate
) {

    function WorkoutView() {
    }

    WorkoutView.prototype.start = function () {
        var view = this;
        var workout = new Workout();

        dialog(workout, 'Create Workout')
            .buttons(
                {text: 'Cancel', action: 'cancel'},
                {text: 'Start', action: 'start'}
            )
            .showModal(createWorkoutTemplate)
            .on('start', function (workout) {
                (view.workout = workout)
                    .start()
                    .catch(onError)
                    .then(showWorkoutPicker);
            });
    };

    dom('.header-content').model(new WorkoutView);

    function showWorkoutPicker (workout) {
        return new Promise(function (resolve, reject) {
            if (!workout.history.length) {
                return resolve(workout);
            }

            dialog(workout, 'Select starting point')
                .buttons(
                    {text: 'Cancel', action: 'cancel'},
                    {text: 'Existing', action: 'existing'},
                    {text: 'Start New', action: 'new'}
                )
                .showModal(selectWorkoutTemplate)
                .on('cancel', reject)
                .on('new', resolve)
                .on('existing', function () {
                    // TODO
                    reject("Sorry, reusing an existing workout currently not supported");
                });
        });
    }

    function onError (error) {
        if (error) {
            dialog.alert(error, 'Oops!');
        }
    }

});
