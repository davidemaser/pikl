/**
 * Created by David Maser on 16/06/2017.
 */
import {Ajax} from '../classes/Ajax';

export class Init{
  constructor(){
    Init.Core();
  }
  static Core(){
    new Ajax();
  }
}
