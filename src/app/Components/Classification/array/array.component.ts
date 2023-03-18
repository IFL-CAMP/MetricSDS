import { Component, OnInit} from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';

@Component({
  selector: 'app-array',
  templateUrl: './array.component.html',
  styleUrls: ['./array.component.scss'],
})
export class ArrayComponent implements OnInit {
  predString: string = '';
  gtString: string = '';
  predArray: Array<number>;
  gtArray: Array<number>;
  maxClass: number;
  warningMessage: string = '';


  constructor(
      private scoreService: ScoresService,
      public classService: ClassesService,
      public UICtrlService: ControlUIService
  ) {
    this.classService.setClasses([0, 1, 2]);
    this.scoreService.initConfMat();
    this.maxClass = 3;
  }

  ngOnInit(): void {
    if(this.scoreService.predictionArray.length != 0) this.predString = this.scoreService.predictionArray.join(",");
    if(this.scoreService.groundtruthArray.length != 0) this.gtString = this.scoreService.groundtruthArray.join(",");
    if(this.gtString.trim() != "" && this.predString.trim() != "") this.initConf();
  }

  initConf(): void {
    if (this.predString.length != 0 && this.gtString.length != 0) {
      let max_value = this.calculateClassNum();
      this.classService.setClasses([...Array(max_value + 1).keys()]);
      this.scoreService.initConfMat();
      this.maxClass = this.classService.classes.length - 1;

      if (this.predArray.length > 0 && this.gtArray.length > 0 && this.predArray.length == this.gtArray.length) {
        if(this.scoreService.isMulti) {
          this.scoreService.isOneUpdate = true;
          this.scoreService.updateConfusionMatrixFromArrayMultiVideos(
              this.predArray,
              this.gtArray,
              this.scoreService.selectedVideo,
              this.scoreService.final_multi_result.size
          )
        }
        else {
          this.scoreService.updateConfusionMatrixFromArray(
              this.predArray,
              this.gtArray
          );
        }
      }
    }
  }

  calculateClassNum() : number {
    let max_value = 0;
    this.predArray = this.predString.split(",").map(Number);
    this.gtArray = this.gtString.split(",").map(Number);
    this.predString = this.predString
        .replace(/ /, ', ')
        .replace(/[^0-9- ,]+/, '').replace(/,,/g, ', ')
        .replace(/\s\s+/g, ' ');
    this.gtString = this.gtString
        .replace(/ /, ', ')
        .replace(/[^0-9-,]+/, '').replace(/,,/g, ', ')
        .replace(/\s\s+/g, ' ');
    this.gtArray = this.gtString
        .trim()
        .split(',')
        .map((value) => {
          let v = parseInt(value);
          if (v > this.maxClass) {
            this.gtString = this.gtString.replace(
                value,
                this.maxClass.toString()
            );
            v = this.maxClass;
          }
          if (v > max_value) {
            max_value = v;
          }
          return v;
        });
    this.predArray = this.predString
        .trim()
        .split(',')
        .map((value) => {
          let v = parseInt(value);

          if (v > this.maxClass) {
            this.predString = this.predString.replace(
                value,
                this.maxClass.toString()
            );
            v = this.maxClass;
          }
          if (v > max_value) {
            max_value = v;
          }
          return v;
        });

    return max_value;
  }

  onChangeArray() {
    let max_value = this.calculateClassNum();
    if (max_value == 0) {
      max_value += 1;
    }
    this.predArray = this.predArray.filter((value) => {
      return !Number.isNaN(value);
    });
    this.gtArray = this.gtArray.filter((value) => {
      return !Number.isNaN(value);
    });
    this.classService.setClasses([...Array(max_value + 1).keys()]);
    this.scoreService.initConfMat();
    if (this.predArray.length > 0 && this.gtArray.length > 0 && this.predArray.length == this.gtArray.length) {
      this.scoreService.canBuild = false;
      this.scoreService.nFrames = this.predArray.length;
      if(this.scoreService.isMulti) {
        this.scoreService.isOneUpdate = true;
        this.scoreService.updateConfusionMatrixFromArrayMultiVideos(
            this.predArray,
            this.gtArray,
            this.scoreService.selectedVideo,
            this.scoreService.final_multi_result.size
        )
      }
      else {
        this.scoreService.updateConfusionMatrixFromArray(
            this.predArray,
            this.gtArray
        );
      }
      this.scoreService.buildPhaseSetup(this.predArray, this.gtArray);
    }
  }

  updateWarningMessage(): void {
    if (this.gtArray.length < this.predArray.length && this.gtArray.length != 0) {
      let count = this.predArray.length - this.gtArray.length;
      this.warningMessage = `Warning: The ground truth is ${count} items smaller than the prediction.`;
    } else if (this.predArray.length < this.gtArray.length && this.predArray.length != 0) {
      let count = this.gtArray.length - this.predArray.length;
      this.warningMessage = `Warning: The prediction is ${count} items smaller than the ground truth.`;
    } else {
      this.warningMessage = '';
    }
  }

}