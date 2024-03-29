import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ClassesService } from 'src/app/Services/classes.service';
import { ControlUIService } from 'src/app/Services/control-ui.service';
import { ScoresService } from 'src/app/Services/scores.service';
import {Score, Stats} from 'src/app/statistic';
import { Phase } from './phase';

@Component({
  selector: 'app-surgical-phase',
  templateUrl: './surgical-phase.component.html',
  styleUrls: ['./surgical-phase.component.scss'],
})
export class SurgicalPhaseComponent implements OnInit {

  isDragging: boolean = false;
  predictionArr: Array<number>;
  isNew: boolean = true;
  labelArr: Array<number>;
  video_count : number = 1;
  isVideoUploaded: boolean = false;
  selectedFile: File;
  activePhase?: Phase;
  startPosition: number;
  tool: string = 'grab';
  @ViewChild("videoPlayer", { static: false }) videoplayer: ElementRef;
  files: any = ['dominant_class_mostly_predicted.json', 'less_dominant_prediction.json',
    'multi_phase_missing.json', 'one_missing_prediction.json', 'underperformed_overlap.json', 'missing_reference_prediction.json', 'multiple_video.json'];


  constructor(
      public scoreService: ScoresService,
      public classService: ClassesService,
      public UICtrlService: ControlUIService,
  ) {
    if(this.scoreService.canBuild) this.buildDefaultSetup();
  }
  ngOnInit(): void {}

  buildDefaultSetup(){
    this.scoreService.nFrames = 99;
    this.scoreService.listPhasePrediction = new Array<Phase>(3);
    this.scoreService.listPhaseGt = new Array<Phase>(3);

    let n_samples = 3;
    let width = 99 / n_samples;
    let previous = null;
    for (let i = 0; i < 3; i++) {
      previous = {
        start: i * width,
        width: width,
        label: i,
        next: null,
        previous: previous,
        exists: true,
      };
      this.scoreService.listPhasePrediction[i] = previous;
      if (i > 0) {
        this.scoreService.listPhasePrediction[i - 1].next = previous;
      }
    }
    previous = null;
    for (let i = 0; i < 3; i++) {
      previous = {
        start: i * width,
        width: width,
        label: i,
        next: null,
        previous: previous,
        exists: true,
      };
      this.scoreService.listPhaseGt[i] = previous;
      if (i > 0) {
        this.scoreService.listPhaseGt[i - 1].next = previous;
      }
    }
    this.classService.setClasses([0, 1, 2]);
    this.classService.setCurrentClass(0);

    this.scoreService.initConfMat();
    if(!this.isVideoUploaded || this.isNew) this.scoreService.updateVideoScore();

  }

  addClass() {
    this.classService.addClass();
    this.scoreService.updateVideoScore();
  }
  changeActiveClass(classIndex: number) {
    this.classService.currentClass = classIndex;
    this.scoreService.updateStateMatrix();
  }
  changeTool(tool: string) {
    this.tool = tool;
  }

  loadSelectedFile(file: any) {
    //to store specific phases that exists in cholec80 dataset
    const dictionary: { [key: string]: number } = {
      "Preparation": 0, "CalotTriangleDissection": 1, "ClippingCutting": 2, "GallbladderDissection": 3,
      "GallbladderPackaging": 4, "CleaningCoagulation": 5, "GallbladderRetraction": 6
    };
    this.video_count = file.length;
    this.isNew = false; // disabled setup
    this.scoreService.canBuild = false;
    this.scoreService.isBinary = false;
    if (this.video_count > 1) { //Multiple Videos
      this.scoreService.final_multi_result = new Map();
      this.isVideoUploaded = true;
      this.scoreService.videoMap = new Map();
      this.scoreService.isSelectedVideo = true;
      this.scoreService.selectedVideo = 0;
      this.scoreService.isMulti = true;
      this.scoreService.videos = [];
      let first_pred_arr = new Array<number>();
      let first_label_arr = new Array<number>();
      this.scoreService.final_label_array = new Map<number, Array<number>>();
      this.scoreService.final_pred_array = new Map<number, Array<number>>();
      for(let i=0; i<this.video_count; i++) {
        const data = file[i]['label_segments'];
        const pred_data = file[i]['pred_segments'];
        this.labelArr = [];
        this.predictionArr = [];
        this.scoreService.videoMap.set(i, data.length);
        for (let i = 0; i < data.length; i++) {
          const value = data[i]['label'];
          let repeated: Array<number> = new Array(data[i]['value']).fill(dictionary[value]).flat();
          this.labelArr = this.labelArr.concat(repeated);
        }
        if(i == 0) first_label_arr = this.labelArr;
        this.scoreService.final_label_array.set(i, this.labelArr);
        for (let j = 0; j < pred_data.length; j++) {
          const value = pred_data[j]['label'];
          let repeated: Array<number> = new Array(pred_data[j]['value']).fill(dictionary[value]).flat();
          this.predictionArr = this.predictionArr.concat(repeated);
        }
        if(i == 0) first_pred_arr = this.predictionArr;
        this.scoreService.predictionArray = first_pred_arr;
        this.scoreService.groundtruthArray = first_label_arr;
        this.fillDefaultData(this.scoreService.selectedVideo, first_pred_arr, first_label_arr);
        this.scoreService.final_pred_array.set(i, this.predictionArr);
        //set fix number to detect missing phases
        this.classService.setClasses([0, 1, 2, 3, 4, 5, 6]);
        this.scoreService.classNumber = this.classService.classes.length;
        this.scoreService.initConfMat();
        this.scoreService.updateConfusionMatrixFromArrayMultiVideos(
            this.predictionArr,
            this.labelArr,
            i,
            this.video_count
        );
      }
    }
    if (this.video_count == 1) { // Single Videos
      this.scoreService.isMulti = false;
      this.isVideoUploaded = true;
      this.scoreService.isSelectedVideo = false;
      this.scoreService.isSelectedOne = false;
      const data = file[0]['label_segments'];
      const pred_data = file[0]['pred_segments'];
      this.labelArr = [];
      this.predictionArr = [];
      for (let i = 0; i < data.length; i++) {
        const value = data[i]['label'];
        let repeated: Array<number> = new Array(data[i]['value']).fill(dictionary[value]).flat();
        this.labelArr = this.labelArr.concat(repeated);
      }
      for (let j = 0; j < pred_data.length; j++) {
        const value = pred_data[j]['label'];
        let repeated: Array<number> = new Array(pred_data[j]['value']).fill(dictionary[value]).flat();
        this.predictionArr = this.predictionArr.concat(repeated);
      }
      this.scoreService.segment_arr_pred = this.predictionArr;
      this.scoreService.segment_arr_label = this.labelArr;
      //set fix number to detect missing phases
      this.classService.setClasses([0, 1, 2, 3, 4, 5, 6]);
      this.scoreService.classNumber = this.classService.classes.length;
      this.scoreService.initConfMat();
      this.scoreService.updateConfusionMatrixFromArray(
          this.predictionArr,
          this.labelArr
      );
      this.scoreService.nFrames = this.predictionArr.length;
      this.scoreService.buildPhaseSetup(this.predictionArr, this.labelArr);
    }
  }

  selectFile(event: any) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, "UTF-8");
    if(this.scoreService.selectedFile) this.scoreService.selectedFile="";
    fileReader.onload = () => {
      if (typeof fileReader.result === "string") {
        const file = JSON.parse(fileReader.result);
        this.loadSelectedFile(file);
      }
      fileReader.onerror = (error) => {
        console.log(error);
      }
    }
  }

  downloadCSV() {
    let csvData = this.convertToCSV(this.scoreService.segment_arr_label, this.scoreService.segment_arr_pred);
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", "data.csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  convertToCSV(data1: Array<number>, data2: Array<number>) {
    let csv = '';
    csv += 'label,prediction\n';
    let length = Math.max(data1.length, data2.length);
    for(let i = 0; i < length; i++) {
      csv += (data1[i]) + ',' + (data2[i]) + '\n';
    }
    return csv;
  }

  //dropdown list handler
  handleVideoSelection(event: any) {
    this.scoreService.isSelectedVideo = true;
    this.scoreService.selectedVideo = event;
    this.scoreService.isMulti = true;
    let video_score = new Array<Score>();
    let item = this.scoreService.final_multi_result.get(this.scoreService.selectedVideo) || [];
    for(let i=0; i<item.length; i++) {
      let args = {
        name: item[i].name,
        score: item[i].score,
        perClassScore: item[i].perClassScore,
        microAverage: item[i].microAverage,
        macroAverage: item[i].macroAverage,
      };
      video_score.push(new Score(args));
    }
    let prediction = this.scoreService.final_pred_array.get(this.scoreService.selectedVideo) || [];
    let groundtruth = this.scoreService.final_label_array.get(this.scoreService.selectedVideo) || [];
    this.predictionArr = prediction;
    this.labelArr = groundtruth;
    this.scoreService.predictionArray = prediction;
    this.scoreService.groundtruthArray = groundtruth;
    this.scoreService.nFrames = prediction.length;
    this.scoreService.segment_arr_label = groundtruth;
    this.scoreService.segment_arr_pred = prediction;
    this.scoreService.fillOneMetricTable(video_score);
    this.scoreService.buildPhaseSetup(prediction, groundtruth);
  }

  fillDefaultData(video_number: number, prediction: Array<number>, groundtruth: Array<number>) {
    this.scoreService.nFrames = prediction.length;
    let video_score = new Array<Score>();
    let item = this.scoreService.final_multi_result.get(video_number) || [];
    for(let i=0; i<item.length; i++) {
      let args = {
        name: item[i].name,
        score: item[i].score,
        perClassScore: item[i].perClassScore,
        microAverage: item[i].microAverage,
        macroAverage: item[i].macroAverage,
      };
      video_score.push(new Score(args));
    }
    this.scoreService.fillOneMetricTable(video_score);
    this.scoreService.segment_arr_pred = prediction;
    this.scoreService.segment_arr_label = groundtruth;
    this.scoreService.buildPhaseSetup(prediction, groundtruth);
  }

  phaseAction(event: MouseEvent | TouchEvent, activePhase: Phase, gt: boolean = false) {
    const container = document.getElementById('timephase');
    if (container && !this.isDragging) {
      if (this.tool == 'cut') {
        let width = container.clientWidth;
        let rect = container.getBoundingClientRect();
        if('touches' in event){
          var offset = (100 * (event.touches[0].clientX - rect.left)) / width;
        }
        else{
          var offset = (100 * (event.clientX - rect.left)) / width;
        }
        let newWidth = offset - activePhase.start;
        newWidth = Math.floor(newWidth);

        let newPhase: Phase = {
          start: offset,
          width: activePhase.width - newWidth,
          label: this.classService.currentClass,
          previous: activePhase,
          next: activePhase.next,
          exists: true,
        };
        activePhase.width = newWidth;
        activePhase.next = newPhase;
        if (gt) {
          let index = this.scoreService.listPhaseGt.indexOf(activePhase);
          this.scoreService.listPhaseGt.splice(index + 1, 0, newPhase);
        } else {
          let index = this.scoreService.listPhasePrediction.indexOf(activePhase);
          this.scoreService.listPhasePrediction.splice(index + 1, 0, newPhase);
        }
      } else if (this.tool == 'fill') {
        activePhase.label = this.classService.currentClass;
      } else if (this.tool == 'delete') {
        if (activePhase.next) {
          activePhase.next.start = activePhase.start;
          activePhase.next.width += activePhase.width;
          this.deletePhase(activePhase);
        } else if (activePhase.previous) {
          activePhase.previous.width += activePhase.width;
          this.deletePhase(activePhase);
        }
      }
    }
    if(this.scoreService.isMulti) {
      this.scoreService.isOneUpdate = true;
      this.updateMultiVideoScore(this.scoreService.selectedVideo);
    } else {
      this.scoreService.updateVideoScore();
    }
  }

  dragPhase(event: MouseEvent | TouchEvent) {
    if (this.isDragging && this.activePhase) {
      const container = document.getElementById('timephase');
      event.preventDefault();
      if (this.activePhase.next && container) {
        let width = container.clientWidth;
        if('touches' in event){
          let new_x = event.touches[0].pageX
          var offset = (100 * (new_x - this.startPosition )) / width
          this.startPosition = new_x
        }
        else{
          var offset = (100 * event.movementX) / width;
        }
        if (
            this.activePhase.width + offset > 0 &&
            this.activePhase.next.width - offset > 0
        ) {
          this.activePhase.width += offset;
          this.activePhase.next.start += offset;
          this.activePhase.next.width -= offset;
        }
      }
      if(this.scoreService.isMulti) {
        this.updateMultiVideoScore(this.scoreService.selectedVideo);
        this.scoreService.isOneUpdate = true; //update video level table
      } else {
        this.scoreService.updateVideoScore();
      }
    }
  }
  startDragging(event: MouseEvent | TouchEvent, phase: Phase) {
    this.isDragging = true;
    this.activePhase = phase;
  }
  stopDragging() {
    this.isDragging = false;
    let n_phases = this.scoreService.listPhasePrediction.length;
    for (let i = 0; i < n_phases; i++) {
      let current_phase = this.scoreService.listPhasePrediction[i];
      if (!(current_phase.width > 0)) {
        this.deletePhase(current_phase);
      }
    }
  }

  deletePhase(phase: Phase) {
    if (phase.previous) {
      phase.previous.next = phase.next;
    }
    if (phase.next) {
      phase.next.previous = phase.previous;
    }
    phase.exists = false;
  }

  updateMultiVideoScore(video_id : number) {
    if (this.classService.classes) {
      this.scoreService.updateListPhase();

      var predicted = new Array<number>(this.scoreService.nFrames);
      var groundtruth = new Array<number>(this.scoreService.nFrames);

      var phasePredicted = this.scoreService.listPhasePrediction[0];
      var phaseGt = this.scoreService.listPhaseGt[0];
      let pred_label = phasePredicted.label;
      let gt_label = phaseGt.label;
      let pred_step = phasePredicted.width;
      let gt_step = phaseGt.width;
      let j = 0;
      let gt = 0;

      for (let i = 0; i < this.scoreService.nFrames; i++) {
        predicted[i] = pred_label;
        j += 1;

        if(phasePredicted.next && j >= pred_step) {
          phasePredicted = phasePredicted.next;
          pred_label = phasePredicted.label;
          pred_step = phasePredicted.width;
          j = 0;
        }
      }
      for (let i = 0; i < this.scoreService.nFrames; i++) {
        groundtruth[i] = gt_label;
        gt += 1;

        if(phaseGt.next && gt >= gt_step) {
          phaseGt = phaseGt.next;
          gt_label = phaseGt.label;
          gt_step = phaseGt.width;
          gt = 0;
        }
      }
      this.scoreService.segment_arr_pred = [];
      this.scoreService.segment_arr_label = [];
      this.scoreService.segment_arr_pred = predicted;
      this.scoreService.segment_arr_label = groundtruth;
      this.scoreService.predictionArray = predicted;
      this.scoreService.groundtruthArray = groundtruth;
      this.scoreService.updateConfusionMatrixFromArrayMultiVideos(
          predicted,
          groundtruth,
          video_id,
          this.scoreService.final_multi_result.size
      );
    }
  }

  onFileSelected(event: any) {
    this.scoreService.selectedFile = event.value;
    const path = 'assets/edge_case_files/' + event.value;
    const reader = new FileReader();

    fetch(path)
        .then(response => response.blob())
        .then(blob => {
              reader.readAsText(blob);
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  const file = JSON.parse(reader.result);
                  this.loadSelectedFile(file);
                }
              }
            }
        )
        .catch(error => console.log(error));
  }

}